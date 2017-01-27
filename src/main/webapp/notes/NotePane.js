import React from 'react';
import Relay from 'react-relay';
import bemTool from '../BemTool';
import Markdown from 'react-remarkable';
import Editor from './NoteEditor';
import NoteUpdateMutation from './NoteUpdateMutation';

class NotePane extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			editing: false, // the editor for this note is enable/disabled
			dirty: false
		};

		if (this.props.selected) {
			this.props.relay.setVariables({ previewOnly: false });
		}
	}

	componentDidMount() {
		if (this.props.selected) {
			this.props.selectPane(this.props.note.id, this);
			this.pane.focus();
		}
	}

	clickHandler = () => {
		if (!this.props.selected) {
			this.props.relay.setVariables({ previewOnly: false });
			this.props.selectPane(this.props.note.id, this);
		} else if (!this.state.editing) {
			this.showHideEditor();
		}
	};

	showHideEditor = () => {
		if (this.state.editing) {
			this.doSave();
			this.pane.focus();
			this.setState({ editing: false, dirty: false });
		} else {
			this.paneHeight = this.pane.clientHeight * .8;
			this.paneWidth = this.pane.clientWidth * .95;
			this.setState({ editing: true });
		}
	};

	makeDirty = () => {
		this.setState({ dirty: true });
	};

	doSave = () => {
		if (this.state.dirty) {
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
			this.props.selected ? 'selected' : null,
			this.props.related ? 'related' : null,
			this.state.editing ? 'editing' : null,
			this.state.dirty ? 'dirty' : null
		].filter(it => it);

		let style = this.state.editing ? {height: this.paneHeight, width: this.paneWidth} : null;

		return (
			<div
			     className={bemTool('note-pane', null, states)}
			     onClick={this.clickHandler}
			     tabIndex="-2"
			     ref={ref => this.pane = ref}>

				<div className={bemTool('note-pane', 'viewer', this.state.editing ? 'hidden' : null)}>
					<Markdown source={content} />
				</div>

				{this.state.editing &&
					<Editor
						style={style}
						className={bemTool('note-pane', 'editor')}
						content={content}
						ref={ref => this.editor = ref}
						notifyDirty={this.makeDirty} />
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