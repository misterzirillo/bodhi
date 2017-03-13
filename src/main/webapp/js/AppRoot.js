import React from 'react';
import Relay from 'react-relay';

import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import NavBar from './nav/NavBar';
import InfinityPane from './InfinityPane';

import MPTT from './MPTT';
import bem from './BemTool';
import AddDeleteNoteMutation from './notes/AddDeleteNoteMutation';
import MoveNodeMutation from './notes/MoveNodeMutation';

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
	'delete-node': 'ctrl+backspace',
	'move-mode-engage': 'ctrl+m'
};

class AppRoot extends React.Component {

	saveFns = {};
	dirtyNodes = [];

	// refs
	_application; // refs the note-columns element
	_selectedNotePane; // refs the currently selected notepane child element
	_mptt; // the current mptt model for relay payload
	relayNodeMap; // for finding relay information about a node by id

	// Shortcut handlers
	handlers = {
		//'save-all': this._doSaveAll,

		// Add/remove nodes
		'insert-sibling-below': () => this._addSiblingBelow(),
		'insert-sibling-above': () => this._addSiblingAbove(),
		'append-child': () => this._appendChild(),
		'delete-node': (e) => this.event_doIfNotTextArea(e, this._deleteSelected),

		// Editing
		'close-open-editor': () => {
			const editing = this._selectedNotePane._showHideEditor();
			if (!editing) {
				this._application.focus();
			}
		},

		// Navigation
		'navigate-sibling-above': (e) => this.event_doIfNotTextArea(e, this._selectSiblingAbove),
		'navigate-sibling-below': (e) => this.event_doIfNotTextArea(e, this._selectSiblingBelow),
		'navigate-parent': (e) => this.event_doIfNotTextArea(e, this._selectParent),
		'navigate-child': (e) => this.event_doIfNotTextArea(e, this._selectChild),

		// Move mode
		'move-mode-engage': (e) => this.event_doIfNotTextArea(e, () => {
			const currentNode = this._getSelectedMpttNode();
			if (currentNode) {
				this.setState({ movingNode: currentNode, moveMode: MoveNodeMutation.MoveMode.AFTER });
			}
		}),
		'enter': (e) => this.event_doIfNotTextArea(e, () => {
			const  { moveMode, movingNode, selectedNodeId } = this.state;
			let canMove = moveMode;

			// shouldn't try to move the node to where it already is
			canMove = canMove && movingNode.id != selectedNodeId;
			if (moveMode == MoveNodeMutation.MoveMode.AFTER && movingNode.siblingAbove) {
				canMove = canMove && !(movingNode.siblingAbove.id == selectedNodeId);
			} else if (moveMode == MoveNodeMutation.MoveMode.BEFORE && movingNode.siblingBelow) {
				canMove = canMove && !(movingNode.siblingBelow.id == selectedNodeId);
			}

			if (canMove) {
				this._moveNode();
			} else if (moveMode) {
				this.setState({ movingNode: null, moveMode: null });
			}
		}),
		'escape': (e) => this.event_doIfNotTextArea(e, () => {
			if (this.state.moveMode) {
				this.setState({ movingNode: null, moveMode: null });
			}
		})
	};

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);

		this._refreshMPTT(props.user.lastSelectedRoot.nodes);
		let lastSelectedNodeId;
		try { lastSelectedNodeId = props.user.lastSelectedRoot.lastEditedNode.id } catch (e) {}
		this.state = {
			selectedNodeId: lastSelectedNodeId,
			movingNode: null,
			moveMode: null
		};
	}

	componentDidMount() {
		this._application.focus();
	}

	componentWillReceiveProps(nextProps) {
		// root container really only receives props when relay returns data,
		// so when we get new props from relay re-create the mptt structure
		const lastNodes = this.props.user.lastSelectedRoot.nodes;
		const { nodes: nextNodes, lastEditedNode } = nextProps.user.lastSelectedRoot;
		if (nextNodes.length > 0) {
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
		} else {
			this._refreshMPTT([]);
			this.setState({ selectedNodeId: null });
		}
	}

	render() {
		const selectedNodeMPTT = this._getSelectedMpttNode();

		return (
			<HotKeys keyMap={keymap} handlers={this.handlers}>

				<NavBar user={this.props.user}/>

				<div ref={this.ref_application} tabIndex="-1" className={bem('note-columns')}>

					{/*<div style={{*/}
					    {/*position: 'absolute',*/}
					    {/*top: '50%',*/}
					    {/*height: '4px',*/}
					    {/*borderTop: '2px solid red',*/}
					    {/*width:'100%'}}*/}
					{/*/>*/}

					{[1, 2, 3].map(level => {
						return (
							<div key={level} className={bem('note-columns', 'column', `level-${level}`)}>
								<InfinityPane>
									{this._mptt.nodeGroupsByLevel(level).map(nodeGroup => (
										<NoteGroup
											key={level > 1 ? nodeGroup.parentNode.id : nodeGroup.nodes[0].id}
											nodeGroup={nodeGroup}
											selectedNode={selectedNodeMPTT}
											selectNode={this._selectNode}
											registerSaveFn={this.prop_registerSaveFn}
										    relayNodeMap={this.relayNodeMap}
										    getMpttNodeById={this._mptt.getNodeById}
										    refForNoteNode={this.ref_selectedNotePane}
										    moveMode={this.state.moveMode}
										    movingNodeId={this.state.moveMode ? this.state.movingNode.id : null}
										/>
									))}
								</InfinityPane>

								{level == 1 && this._mptt.nodeGroupsByLevel(1).length == 0 &&
									<div onClick={this.event_createFirstLeaf} className={[
										bem('note-columns', 'add-first-note'), bem('note-pane', null, 'dirty')
									].join(' ')}>
										<h2><i className="fa fa-plus-circle"/> Create Leaf</h2>
									</div>
								}

							</div>
						);
					})}

				</div>
			</HotKeys>
		);
	}
	//</editor-fold>

	//<editor-fold desc="Private">
	_moveNode = () => {
		const { movingNode, moveMode, selectedNodeId } = this.state;

		const mutation = new MoveNodeMutation({
			lastSelectedRoot: this.props.user.lastSelectedRoot,
			targetNodeId: selectedNodeId,
			movingNodeId: movingNode.id,
			moveMode: moveMode
		});
		this.props.relay.commitUpdate(mutation);

		this.setState({ selectedNodeId: movingNode.id, moveMode: null });
	};

	_refreshMPTT = (nextNodes) => {
		this._mptt = new MPTT(nextNodes);
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
		const selectedNode = this._getSelectedMpttNode();
		if (selectedNode) {
			const mutation = new AddDeleteNoteMutation({
				leftBound: selectedNode.rightBound + 1,
				lastSelectedRoot: this.props.user.lastSelectedRoot,
				type: AddDeleteNoteMutation.ADD
			});
			this.props.relay.commitUpdate(mutation);
		}
	};

	_addSiblingAbove = () => {
		const selectedNode = this._getSelectedMpttNode();
		if (selectedNode) {
			const mutation = new AddDeleteNoteMutation({
				leftBound: selectedNode.leftBound,
				lastSelectedRoot: this.props.user.lastSelectedRoot,
				type: AddDeleteNoteMutation.ADD
			});
			this.props.relay.commitUpdate(mutation);
		}
	};

	_appendChild = () => {
		const selectedNode = this._getSelectedMpttNode();
		if (selectedNode && selectedNode.level < 3) {
			const mutation = new AddDeleteNoteMutation({
				leftBound: selectedNode.leftBound + 1,
				lastSelectedRoot: this.props.user.lastSelectedRoot,
				type: AddDeleteNoteMutation.ADD
			});
			this.props.relay.commitUpdate(mutation);
		}
	};

	_deleteSelected = () => {
		const selectedNodeId = this.state.selectedNodeId;
		if (selectedNodeId) {
			const mutation = new AddDeleteNoteMutation({
				nodeId: selectedNodeId,
				lastSelectedRoot: this.props.user.lastSelectedRoot,
				type: AddDeleteNoteMutation.DELETE
			});
			this.props.relay.commitUpdate(mutation);
		}
	};

	_getSelectedMpttNode = () => this._mptt.getNodeById(this.state.selectedNodeId);

	_selectSiblingAbove = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt) {
			let above = mptt.getAbove();
			let moveMode = this.state.moveMode;

			if (moveMode) {
				moveMode = MoveNodeMutation.MoveMode.BEFORE;
				if (this.state.moveMode == MoveNodeMutation.MoveMode.AFTER) above = mptt;
				else if (above.siblingBelow == null) moveMode = MoveNodeMutation.MoveMode.AFTER;
			}

			this._selectNode(above.id, moveMode);
		}
	};

	_selectSiblingBelow = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt) {
			let below = mptt.getBelow();
			let moveMode = this.state.moveMode;

			if (moveMode) {
				moveMode = MoveNodeMutation.MoveMode.AFTER;
				if (this.state.moveMode == MoveNodeMutation.MoveMode.BEFORE) below = mptt;
				else if (below.siblingAbove == null) moveMode = MoveNodeMutation.MoveMode.BEFORE;
			}

			this._selectNode(below.id, moveMode);
		}
	};

	_selectParent = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt && mptt.containingNodeGroup.parentNode) {
			const { id } = mptt.containingNodeGroup.parentNode;
			this._selectNode(id, this.state.moveMode ? MoveNodeMutation.MoveMode.BEFORE : null);
		}
	};

	_selectChild = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt && mptt.childNodeGroup) {
			const { id } = mptt.childNodeGroup.nodes[0];
			this._selectNode(id, this.state.moveMode ? MoveNodeMutation.MoveMode.BEFORE : null);
		}
	};

	_selectNode = (nodeId, moveMode) => {
		if (this.state.selectedNodeId != nodeId || moveMode) {
			this.setState({selectedNodeId: nodeId, moveMode});
		}
	};

	event_createFirstLeaf = () => {
		const mutation = new AddDeleteNoteMutation({
			leftBound: 0,
			lastSelectedRoot: this.props.user.lastSelectedRoot,
			type: AddDeleteNoteMutation.ADD
		});
		this.props.relay.commitUpdate(mutation);
	};
	//</editor-fold>

	//<editor-fold desc="Bindings">
	event_doIfNotTextArea = (event, fn) => {
		if (event.srcElement.type != 'textarea')
			fn();
	};

	prop_registerSaveFn = (id, fn) => {
		if (!this.saveFns[id])
			this.saveFns[id] = fn;

		this.dirtyNodes.push(id);
	};

	ref_selectedNotePane = (ref) => this._selectedNotePane = ref;

	ref_application = (ref) => this._application = ref;
	//</editor-fold>
}

export default Relay.createContainer(AppRoot, {
	fragments: {
		user: () => Relay.QL`
			fragment on User {

				${NavBar.getFragment('user')}

				lastSelectedRoot {

					${AddDeleteNoteMutation.getFragment('lastSelectedRoot')}
					${MoveNodeMutation.getFragment('lastSelectedRoot')}

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
