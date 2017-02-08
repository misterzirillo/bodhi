import React from 'react';
import Relay from 'react-relay';
import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import { resolveMPTT, areRelated } from './MPTT';
import bemTool from './BemTool';
import InfinityPane from './InfinityPane';
import AddNoteMutation from './notes/AddNoteMutation';

const keymap = {
	'close-open-editor': 'ctrl+enter',
	'save-all': 'ctrl+s',
	//'center-nodes': 'ctrl+space',
	'navigate-parent': 'ctrl+left',
	'navigate-child': 'ctrl+right',
	'navigate-sibling-above': 'ctrl+up',
	'navigate-sibling-below': 'ctrl+down',
	'insert-sibling-below': 'ctrl+shift+down',
	'insert-sibling-above': 'ctrl+shift+up',
	'append-child': 'ctrl+shift+right'
};

class AppRoot extends React.Component {

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);
		this.state = {
			selectedNoteId: props.user.lastSelectedRoot.lastEditedNote.id,
		};

		this.handlerProxy = {
			'save-all': this._doSaveAll,
			'navigate-parent': this._selectParent,
			'navigate-child': this._selectChild,
			'navigate-sibling-above': this._selectSiblingAbove,
			'navigate-sibling-below': this._selectSiblingBelow,
			'insert-sibling-below': this._addSiblingBelow,
			'insert-sibling-above': this._addSiblingAbove,
			'append-child': this._appendChild
		};

		this._refreshMPTT(props.user.lastSelectedRoot.nodes);
		this.saveFns = {};
		this.dirtyNodes = [];
	}

	componentWillReceiveProps(nextProps) {
		// root container really only receives props when relay returns data,
		// so when we get new props from relay re-create the mptt structure
		const lastNodes = this.props.user.lastSelectedRoot.nodes;
		const { nodes: nextNodes, lastEditedNote } = nextProps.user.lastSelectedRoot;
		if (nextNodes.length != lastNodes.length) {
			// node was added/removed
			this._refreshMPTT(nextNodes);
			this.setState({ selectedNoteId: lastEditedNote.id });
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

					<div style={{
					    position: 'absolute',
					    top: '50%',
					    height: '4px',
					    borderTop: '2px solid red',
					    width:'100%'}}></div>

					<div className={bemTool('note-columns', 'column', 'level-1')}>
						<InfinityPane>
							{levelOne.map((node) => {
								const selected = node.id == selectedNodeMPTT.id;
								const related = selected ? false : areRelated(node, selectedNodeMPTT);
								return (
									<NoteGroup key={node.id}>
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
								return (
									<NoteGroup key={i}>
										{nodeGroup.map(node => {
											const selected = node.id == selectedNodeMPTT.id;
											return <NotePane
												key={node.id}
												note={this.relayNodeMap[node.id]}
												selected={selected}
												related={selected ? false : areRelated(node, selectedNodeMPTT)}
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
								return (
									<NoteGroup key={i}>
										{nodeGroup.map(node => {
											const selected = node.id == selectedNodeMPTT.id;
											return <NotePane
												key={node.id}
												note={this.relayNodeMap[node.id]}
												selected={selected}
												related={selected ? false : areRelated(node, selectedNodeMPTT)}
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

	_addSiblingBelow = () => {
		const selectedNode = this.mptt.nodeMap[this.state.selectedNoteId];
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.rightBound + 1,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_addSiblingAbove = () => {
		const selectedNode = this.mptt.nodeMap[this.state.selectedNoteId];
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.leftBound,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_appendChild = () => {
		const selectedNode = this.mptt.nodeMap[this.state.selectedNoteId];
		if (selectedNode.level < 3) {
			const mutation = new AddNoteMutation({
				leftBound: selectedNode.leftBound + 1,
				lastSelectedRoot: this.props.user.lastSelectedRoot
			});
			this.props.relay.commitUpdate(mutation);
		}
	};
	//</editor-fold>

	//<editor-fold desc="Props">
	prop_selectPane = (noteId) => {
		if (this.state.selectedNoteId != noteId)
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
				
					${AddNoteMutation.getFragment('lastSelectedRoot')}
				
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