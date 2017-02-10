import React from 'react';
import Relay from 'react-relay';
import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import MPTT from './MPTT';
import bemTool from './BemTool';
import InfinityPane from './InfinityPane';
import AddNoteMutation from './notes/AddNoteMutation';

const keymap = {
	'close-open-editor': 'ctrl+enter',
	'save-all': 'ctrl+s',
	//'center-nodes': 'ctrl+space',
	'insert-sibling-below': 'ctrl+shift+down',
	'insert-sibling-above': 'ctrl+shift+up',
	'append-child': 'ctrl+shift+right',
	'navigate-parent': 'left',
	'navigate-child': 'right',
	'navigate-sibling-above': 'up',
	'navigate-sibling-below': 'down',
};

class AppRoot extends React.Component {

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);

		this.handlerProxy = {
			'save-all': this._doSaveAll,
			'insert-sibling-below': this._addSiblingBelow,
			'insert-sibling-above': this._addSiblingAbove,
			'append-child': this._appendChild
		};

		this._refreshMPTT(props.user.lastSelectedRoot.nodes);
		const lastSelectedNodeId = props.user.lastSelectedRoot.lastEditedNode.id;
		this.state = {
			selectedNodeId: lastSelectedNodeId
		};

		this.saveFns = {};
		this.dirtyNodes = [];
	}

	componentWillReceiveProps(nextProps) {
		// root container really only receives props when relay returns data,
		// so when we get new props from relay re-create the mptt structure
		const lastNodes = this.props.user.lastSelectedRoot.nodes;
		const { nodes: nextNodes, lastEditedNode } = nextProps.user.lastSelectedRoot;
		if (nextNodes.length != lastNodes.length) {
			// node was added/removed
			this._refreshMPTT(nextNodes);
			this.setState({ selectedNodeId: lastEditedNode.id });
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
		const selectedNodeMPTT = this.mptt.getNodeById(this.state.selectedNodeId);

		return (
			<HotKeys keyMap={keymap} handlers={this.handlerProxy}>
				<div className={bemTool('note-columns')}>

					<div style={{
					    position: 'absolute',
					    top: '50%',
					    height: '4px',
					    borderTop: '2px solid red',
					    width:'100%'}}></div>

					{[1, 2, 3].map(level => {
						return <div key={level} className={bemTool('note-columns', 'column', `level-${level}`)}>
							<InfinityPane>
								{this.mptt.nodeGroupsByLevel(level).map((nodeGroup, i) => (
									<NoteGroup
										key={i}
										nodeGroup={nodeGroup}
										selectedNode={selectedNodeMPTT}
										selectNode={this.prop_selectNode}
										registerSaveFn={this.prop_registerSaveFn}
									    relayNodeMap={this.relayNodeMap}
									    getMpttNodeById={this.mptt.getNodeById}
									/>
								))}
							</InfinityPane>
						</div>
					})}

				</div>
			</HotKeys>
		);
	}
	//</editor-fold>

	//<editor-fold desc="Private">
	_refreshMPTT = (nextNodes) => {
		this.mptt = new MPTT(nextNodes);
		this.relayNodeMap = nextNodes.reduce(function(map, node) {
			map[node.id] = node;
			return map;
		}, {});
	};

	_doSaveAll = () => {
		for (let id of this.dirtyNodes) {
			this.saveFns[id]();
		}
		this.dirtyNodes = [];
	};

	_addSiblingBelow = () => {
		const selectedNode = this.mptt._nodeMap[this.state.selectedNodeId];
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.rightBound + 1,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_addSiblingAbove = () => {
		const selectedNode = this.mptt._nodeMap[this.state.selectedNodeId];
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.leftBound,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_appendChild = () => {
		const selectedNode = this.mptt._nodeMap[this.state.selectedNodeId];
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
	prop_selectNode = (noteId) => {
		if (this.state.selectedNodeId != noteId)
			this.setState({selectedNodeId: noteId});
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
					lastEditedNode {
						id,
						leftBound,
						rightBound,
						content(preview: false)
					},
					
					nodes {
						id,
						leftBound,
						rightBound,
						${NotePane.getFragment('node')}
					}
				}
			}`
	}
});