import React from 'react';
import Relay from 'react-relay';
import bemTool from '../BemTool';
//let JsDiff = require('diff');
import Markdown from 'react-remarkable';
import Editor from './NoteEditor';
import NoteUpdateMutation from './NoteUpdateMutation';

class NotePane extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			editing: false, // the editor for this note is enable/disabled
			related: this.props.related, // this note tree is focused
			selected: this.props.selected, // this node is focused
			dirty: false
		};

		if (this.props.selected) {
			this.props.relay.setVariables({ previewOnly: false });
		}
	}

	componentDidMount() {
		if (this.state.selected) {
			this.props.selectPane(this.props.note.id, this);
		}
	}

	clickHandler = () => {
		if (!this.state.selected) {
			this.props.relay.setVariables({ previewOnly: false });
			this.props.selectPane(this.props.note.id, this.refs.component);
		} else if (!this.state.editing) {
			this.showHideEditor();
		}
	};

	showHideEditor = () => {
		if (this.state.editing) {
			this.doSave();
			this.setState({ editing: false, dirty: false });
		} else {
			this.paneHeight = this.pane.offsetHeight;
			this.setState({ editing: true });
		}
	};

	makeDirty = () => {
		this.setState({ dirty: true });
	};

	doSave = () => {
		if (this.state.editing) {
			const newContent = this.editor.getValue();
			if (this.props.note.content != newContent) {
				const mutation = new NoteUpdateMutation({
					nodeId: this.props.note.id,
					patch: this.editor.getValue()
				});
				this.props.relay.commitUpdate(mutation);
			}
		}
	};

	render() {
		const { content } = this.props.note;
		const states = [
			this.state.selected ? 'selected' : null,
			this.state.related ? 'related' : null,
			this.state.editing ? 'editing' : null,
			this.state.dirty ? 'dirty' : null
		].filter(it => it);

		let style = this.state.editing ? {height: this.paneHeight} : null;

		return (
			<div style={style}
			     className={bemTool('note-pane', null, states)}
			     onClick={this.clickHandler}
			     ref={ref => this.pane = ref}>
				{
					this.state.editing
						? <Editor
							className={bemTool('note-pane', 'editor')}
							content={content}
							ref={ref => this.editor = ref}
							notifyDirty={this.makeDirty}/>
						: <Markdown source={content} />
				}
			</div>
		);
	}
}

export default Relay.createContainer(NotePane, {
	initialVariables: {
		previewOnly: true
	},
	fragments: {
		note: () => Relay.QL`fragment on NoteNode { id, content(preview: $previewOnly) }`
	}
});