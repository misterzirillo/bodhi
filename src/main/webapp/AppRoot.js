import React from 'react';
import Relay from 'react-relay';
import NoteGroup from './notes/NoteGroup';
import NotePane from './notes/NotePane';
import { HotKeys, FocusTrap } from 'react-hotkeys';
import { resolveMPTT, levelOneRelation, levelTwoRelation, levelThreeRelation } from './MPTT';
import bemTool from './BemTool';

const keymap = {
	'close-open-editor': 'ctrl+enter',
	'save-node': 'ctrl+s',
	'center-nodes': 'ctrl+space'
};

class AppRoot extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedNoteId: props.user.lastSelectedRoot.lastEditedNote.id,
		};

		this.handlerProxy = {
			'close-open-editor': () => {
				console.log('open close');
				this.selectedPane.showHideEditor();
			},
			'save-node': () => { this.selectedPane.doSave() }
		}
	}

	_createNodeHierarchy = () => {
		const nodes = this.props.user.lastSelectedRoot.nodes.slice(0); // copy the props
		const root = { leftBound: 0, rightBound: Math.max(...nodes.map(n => n.rightBound)) + 1 };
		const hierarchy = resolveMPTT(root, nodes);
		const levelOne = hierarchy.children;
		const levelTwo = levelOne.map(node => node.children ? node.children : []);
		const levelThree = levelTwo.reduce((a, b) => a.concat(b), []).map(node => node.children ? node.children : []);
		return [ levelOne, levelTwo, levelThree ];
	};

	selectPane = (noteId, pane) => {
		this.selectedPane = pane;
		this.setState({ selectedNoteId: noteId });
	};

	render() {
		const lastSelectedNode = this.props.user.lastSelectedRoot.nodes.find(node => node.id === this.state.selectedNoteId);
		const heirarchy = this._createNodeHierarchy();

		const levelOne = (
			<div className={bemTool('note-columns', 'column', 'level-1')}>
				{heirarchy[0].map((node) => {
					const related = levelOneRelation(node, lastSelectedNode);
					const selected = node.id === lastSelectedNode.id;
					return (
						<NoteGroup key={node.id} related={related}>
							<NotePane
								note={node}
								selected={selected}
								related={related}
							    selectPane={this.selectPane}
							/>
						</NoteGroup>
					);
				})}
			</div>
		);

		const levelTwo = (
			<div className={bemTool('note-columns', 'column', 'level-2')}>
				{heirarchy[1].map((nodeGroup, i) => {
					if (nodeGroup && nodeGroup[0]) {
						return <NoteGroup key={i} related={levelTwoRelation(nodeGroup[0], lastSelectedNode)}>
							{nodeGroup.map(node => {
								const selected = node.id === lastSelectedNode.id;
								return <NotePane
									key={node.id} // TODO study node move
									note={node}
									selected={selected}
									related={levelTwoRelation(node, lastSelectedNode)}
									selectPane={this.selectPane}
								/>;
							})}
						</NoteGroup>
					}
				})}
			</div>
		);

		const levelThree = (
			<div className={bemTool('note-columns', 'column', 'level-3')}>
				{heirarchy[2].map((nodeGroup, i) => {
					if (nodeGroup && nodeGroup[0]) {
						return <NoteGroup key={i} related={levelThreeRelation(nodeGroup[0], lastSelectedNode)}>
							{nodeGroup.map(node => {
								const selected = node.id === lastSelectedNode.id;
								return <NotePane
									key={node.id} // TODO study node move
									note={node}
									selected={selected}
									related={levelThreeRelation(node, lastSelectedNode)}
									selectPane={this.selectPane}
								/>;
							})}
						</NoteGroup>
					}
				})}
			</div>
		);

		return (
			<HotKeys keyMap={keymap} handlers={this.handlerProxy}>
				<div className={bemTool('note-columns')}>
					{levelOne}
					{levelTwo}
					{levelThree}
				</div>
			</HotKeys>
		);
	}
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