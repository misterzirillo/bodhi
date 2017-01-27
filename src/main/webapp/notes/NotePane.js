import React from 'react';
import Relay from 'react-relay';
import bemTool from '../BemTool';
import Markdown from 'react-remarkable';
import Editor from './NoteEditor';
import NoteUpdateMutation from './NoteUpdateMutation';

class NotePane extends React.Component {

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);
		this.state = {
			editing: false, // the editor for this note is enable/disabled
			dirty: false
		};

		if (this.props.selected) {
			this.props.relay.setVariables({previewOnly: false});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.dirty && this.props.note.content != nextProps.note.content) {
			this.setState({ dirty: false });
		}
	}

	componentDidUpdate() {
		if (this.props.selected) {
			if (this.state.editing) {
				this.editor.focus();
			} else {
				this.pane.focus();
			}

			this.props.selectPane(this.props.note.id, this);
		} else if (this.state.editing) {
			this.editor.blur();
		}
	}

	componentDidMount() {
		if (this.props.selected) {
			this.props.selectPane(this.props.note.id, this);
			this.pane.focus();
		}
	}

	render() {
		const {content} = this.props.note;
		const states = [
			this.props.selected ? 'selected' : null,
			this.props.related ? 'related' : null,
			this.state.editing ? 'editing' : null,
			this.state.dirty ? 'dirty' : null
		].filter(it => it);

		return (
			<div
				className={bemTool('note-pane', null, states)}
				onClick={this._clickHandler}
				tabIndex="-2"
				ref={ref => this.pane = ref}>

				<div className={bemTool('note-pane', 'viewer', this.state.editing ? 'hidden' : null)}>
					<Markdown source={content}/>
				</div>

				{this.state.editing &&
					<Editor
						className={bemTool('note-pane', 'editor')}
						content={content}
						ref={ref => this.editor = ref}
						notifyDirty={this.prop_makeDirty}
					/>
				}

				{this.state.editing &&
					<div onClick={this.showHideEditor} className={bemTool('note-pane', 'close-button')}><b>✖</b></div>
				}
			</div>
		);
	}
	//</editor-fold>

	//<editor-fold desc="Private">
	_clickHandler = () => {
		if (!this.props.selected) {
			this.props.relay.setVariables({previewOnly: false});
			this.props.selectPane(this.props.note.id, this);
		} else if (!this.state.editing) {
			this.showHideEditor();
		}
	};

	_doSave = () => {
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
	//</editor-fold>

	showHideEditor = () => {
		if (this.state.editing) {
			this.pane.focus();
			this._doSave();
			this.setState({ editing: false });
		} else {
			this.setState({ editing: true });
		}
	};

	prop_makeDirty = () => {
		if (!this.state.dirty) {
			this.props.registerSaveFn(this.props.note.id, this._doSave);
			this.setState({dirty: true});
		}
	};
}

export default Relay.createContainer(NotePane, {
	initialVariables: {
		previewOnly: true
	},
	fragments: {
		note: () => Relay.QL`fragment on NoteNode { id, content(preview: $previewOnly) }`
	}
});