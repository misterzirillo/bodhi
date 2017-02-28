import React from 'react';
import Relay from 'react-relay';

import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import NavBar from './nav/NavBar';
import NoteRootPicker from './nav/NoteRootPicker';
import NoteColumn from './notes/NoteColumn';

import MPTT from './MPTT';
import bem from './BemTool';
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

	saveFns = {};
	dirtyNodes = [];
	handlers = {
		'save-all': this._doSaveAll,
		'insert-sibling-below': this._addSiblingBelow,
		'insert-sibling-above': this._addSiblingAbove,
		'append-child': this._appendChild,
		'close-open-editor': () => {
			const editing = this._selectedNotePane._showHideEditor();
			if (!editing) {
				this._application.focus();
			}
		},
		'navigate-sibling-above': () => this._selectedNotePane._doIfNotEditing(this._selectSiblingAbove),
		'navigate-sibling-below': () => this._selectedNotePane._doIfNotEditing(this._selectSiblingBelow),
		'navigate-parent': () => this._selectedNotePane._doIfNotEditing(this._selectParent),
		'navigate-child': () => this._selectedNotePane._doIfNotEditing(this._selectChild)
	};

	// refs
	_application; // refs the note-columns element
	_selectedNotePane; // refs the currently selected notepane child element
	_mptt; // the current mptt model for relay payload
	relayNodeMap; // for finding relay information about a node by id

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);

		this._refreshMPTT(props.user.lastSelectedRoot.nodes);
		const lastSelectedNodeId = props.user.lastSelectedRoot.lastEditedNode.id;
		this.state = {
			selectedNodeId: lastSelectedNodeId
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
		const selectedNodeMPTT = this._getSelectedMpttNode();

		return (
			<HotKeys keyMap={keymap} handlers={this.handlers}>

				<NavBar user={this.props.user}>
					<NoteRootPicker user={this.props.user} />
				</NavBar>

				<div autoFocus ref={this.ref_application} tabIndex="-1" className={bem('note-columns')}>

					<div style={{
					    position: 'absolute',
					    top: '50%',
					    height: '4px',
					    borderTop: '2px solid red',
					    width:'100%'}}></div>

					{[1, 2, 3].map(level => {
						return (
							<NoteColumn key={level} level={level}>
								{this._mptt.nodeGroupsByLevel(level).map(nodeGroup => (
									<NoteGroup
										key={[
											nodeGroup.nodes[0].leftBound, // lowest leftBound
											nodeGroup.nodes[nodeGroup.nodes.length - 1]  // highest rightBound
										]}
										nodeGroup={nodeGroup}
										selectedNode={selectedNodeMPTT}
										selectNode={this._selectNode}
										registerSaveFn={this.prop_registerSaveFn}
									    relayNodeMap={this.relayNodeMap}
									    getMpttNodeById={this._mptt.getNodeById}
									    refForNoteNode={this.ref_selectedNotePane}
									/>
								))}
							</NoteColumn>
						);
					})}

				</div>
			</HotKeys>
		);
	}
	//</editor-fold>

	//<editor-fold desc="Private">
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
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.rightBound + 1,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_addSiblingAbove = () => {
		const selectedNode = this._getSelectedMpttNode();
		const mutation = new AddNoteMutation({
			leftBound: selectedNode.leftBound,
			lastSelectedRoot: this.props.user.lastSelectedRoot
		});
		this.props.relay.commitUpdate(mutation);
	};

	_appendChild = () => {
		const selectedNode = this._getSelectedMpttNode();
		if (selectedNode.level < 3) {
			const mutation = new AddNoteMutation({
				leftBound: selectedNode.leftBound + 1,
				lastSelectedRoot: this.props.user.lastSelectedRoot
			});
			this.props.relay.commitUpdate(mutation);
		}
	};

	_getSelectedMpttNode = () => this._mptt.getNodeById(this.state.selectedNodeId);

	_selectSiblingAbove = () => {
		const mptt = this._getSelectedMpttNode();
		let above = mptt.siblingAbove;
		if (above == null) {
			const nextGroup = mptt.containingNodeGroup.groupAbove.nodes;
			above = nextGroup[nextGroup.length - 1];
		}
		this._selectNode(above.id);
	};

	_selectSiblingBelow = () => {
		const mptt = this._getSelectedMpttNode();
		let below = mptt.siblingBelow;
		if (below == null) {
			const nextGroup = mptt.containingNodeGroup.groupBelow.nodes;
			below = nextGroup[0];
		}
		this._selectNode(below.id);
	};

	_selectParent = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt.parentNode) {
			this._selectNode(mptt.parentNode.id);
		}
	};

	_selectChild = () => {
		const mptt = this._getSelectedMpttNode();
		if (mptt.childNodeGroup) {
			this._selectNode(mptt.childNodeGroup.nodes[0].id);
		}
	};

	_selectNode = (noteId, ref) => {
		if (this.state.selectedNodeId != noteId) {
			this._selectedNotePane = ref;
			this.setState({selectedNodeId: noteId});
		}
	};
	//</editor-fold>

	//<editor-fold desc="Bindings">
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
				${NoteRootPicker.getFragment('user')}

				lastSelectedRoot {

					${AddNoteMutation.getFragment('lastSelectedRoot')}

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
