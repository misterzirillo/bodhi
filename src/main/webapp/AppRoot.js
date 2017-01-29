import React from 'react';
import Relay from 'react-relay';
import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import { resolveMPTT, areRelated } from './MPTT';
import bemTool from './BemTool';
import InfinityPane from './InfinityPane';

const keymap = {
	'close-open-editor': 'ctrl+enter',
	'save-all': 'ctrl+s',
	//'center-nodes': 'ctrl+space',
	'navigate-parent': 'left',
	'navigate-child': 'right',
	'navigate-sibling-above': 'up',
	'navigate-sibling-below': 'down'
};

class AppRoot extends React.Component {

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);
		this.state = {
			selectedNoteId: props.user.lastSelectedRoot.lastEditedNote.id,
		};

		this.handlerProxy = {
			'close-open-editor': () => this.selectedPane.showHideEditor(),
			'save-all': this._doSaveAll,
			'navigate-parent': this._selectParent,
			'navigate-child': this._selectChild,
			'navigate-sibling-above': this._selectSiblingAbove,
			'navigate-sibling-below': this._selectSiblingBelow
		};

		this._refreshMPTT(props.user.lastSelectedRoot.nodes);
		this.saveFns = {};
		this.dirtyNodes = [];
	}

	componentWillReceiveProps(nextProps) {
		// optimize the creation of the mptt structure
		const lastNodes = this.props.user.lastSelectedRoot.nodes;
		const nextNodes = nextProps.user.lastSelectedRoot.nodes;
		if (nextNodes.length != lastNodes.length) {
			this._refreshMPTT(nextNodes);
		} else {
			for (let i = 0; i < lastNodes.length; i++) {
				const curr = lastNodes[i];
				const next = nextNodes[i];

				// if we detect a change in node order then re-create the tree
				if (curr.leftBound != next.leftBound || curr.rightBound != next.rightBound) {
					this._refreshMPTT(nextNodes);
					break;
				}
			}
		}
	}

	render() {
		const { nodeMap, levelOne, levelTwo, levelThree } = this.mptt;
		const selectedNodeMPTT = nodeMap[this.state.selectedNoteId];

		return (
			<HotKeys keyMap={keymap} handlers={this.handlerProxy}>
				<div className={bemTool('note-columns')}>
					<div className={bemTool('note-columns', 'column', 'level-1')}>
						<InfinityPane>
							{levelOne.map((node) => {
								const selected = node.id == selectedNodeMPTT.id;
								const related = selected ? false : areRelated(node, selectedNodeMPTT);
								return (
									<NoteGroup key={node.id} related={related}>
										<NotePane
											note={this.relayNodeMap[node.id]}
											selected={selected}
											related={related}
											selectPane={this.prop_selectPane}
										    registerSaveFn={this.prop_registerSaveFn}
										/>
									</NoteGroup>
								);
							})}
						</InfinityPane>
					</div>

					<div className={bemTool('note-columns', 'column', 'level-2')}>
						<InfinityPane>
							{levelTwo.map((nodeGroup, i) => {
								const related = areRelated(nodeGroup[0], selectedNodeMPTT);
								return (
									<NoteGroup key={i} related={related}>
										{nodeGroup.map(node => {
											const selected = node.id == selectedNodeMPTT.id;
											return <NotePane
												key={node.id}
												note={this.relayNodeMap[node.id]}
												selected={selected}
												related={selected ? false : related}
												selectPane={this.prop_selectPane}
												registerSaveFn={this.prop_registerSaveFn}
											/>;
										})}
									</NoteGroup>
								);
							})}
						</InfinityPane>
					</div>

					<div className={bemTool('note-columns', 'column', 'level-3')}>
						<InfinityPane>
							{levelThree.map((nodeGroup, i) => {
								const related = areRelated(nodeGroup[0], selectedNodeMPTT);
								return (
									<NoteGroup key={i} related={related}>
										{nodeGroup.map(node => {
											const selected = node.id == selectedNodeMPTT.id;
											return <NotePane
												key={node.id}
												note={this.relayNodeMap[node.id]}
												selected={selected}
												related={selected ? false : related}
												selectPane={this.prop_selectPane}
												registerSaveFn={this.prop_registerSaveFn}
											/>;
										})}
									</NoteGroup>
								);
							})}
						</InfinityPane>
					</div>

				</div>
			</HotKeys>
		);
	}
	//</editor-fold>

	//<editor-fold desc="Private">
	_refreshMPTT = (nextNodes) => {
		this.mptt = resolveMPTT(nextNodes);
		this.relayNodeMap = nextNodes.reduce(function(map, node) {
			map[node.id] = node;
			return map;
		}, {});
	};

	_selectParent = () => {
		const selected = this.mptt.nodeMap[this.state.selectedNoteId];
		if (selected.parent.id) {
			this.setState({ selectedNoteId: selected.parent.id });
		}
	};

	_selectChild = () => {
		const selected = this.mptt.nodeMap[this.state.selectedNoteId];
		if (selected.children.length) {
			this.setState({ selectedNoteId: selected.children[0].id });
		}
	};

	_selectSiblingAbove = () => {
		const above = this.mptt.nodeMap[this.state.selectedNoteId].siblingAbove;
		this.setState({ selectedNoteId: above.id });
	};

	_selectSiblingBelow = () => {
		const below = this.mptt.nodeMap[this.state.selectedNoteId].siblingBelow;
		this.setState({ selectedNoteId: below.id });
	};

	_doSaveAll = () => {
		for (let id of this.dirtyNodes) {
			this.saveFns[id]();
		}
		this.dirtyNodes = [];
	};
	//</editor-fold>

	//<editor-fold desc="Props">
	prop_selectPane = (noteId, pane) => {
		this.selectedPane = pane;
		this.setState({selectedNoteId: noteId});
	};

	prop_registerSaveFn = (id, fn) => {
		if (!this.saveFns[id])
			this.saveFns[id] = fn;

		this.dirtyNodes.push(id);
	};
	//</editor-fold>

}

export default Relay.createContainer(AppRoot, {
	fragments: {
		user: () => Relay.QL`
			fragment on User {
			
				lastSelectedRoot {
					name,
					lastEditedNote {
						id,
						leftBound,
						rightBound,
						content(preview: false)
					},
					
					nodes {
						id,
						leftBound,
						rightBound,
						${NotePane.getFragment('note')}
					}
				}
			}`
	}
});