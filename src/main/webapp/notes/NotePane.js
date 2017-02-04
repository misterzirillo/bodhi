import React from 'react';
import Relay from 'react-relay';
import bemTool from '../BemTool';
import Markdown from 'react-remarkable';
import Editor from './NoteEditor';
import NoteUpdateMutation from './NoteUpdateMutation';
import { HotKeys } from 'react-hotkeys';

class NotePane extends React.Component {

	//<editor-fold desc="Component lifecycle">
	constructor(props) {
		super(props);

		this.state = {
			editing: !props.note, // the editor for this note is enable/disabled
			dirty: false
		};

		if (props.selected) {
			this.props.relay.setVariables({previewOnly: false});
		}

		this.handlers = {
			'close-open-editor': this._showHideEditor
		};

		this.scrollAfterUpdate = (props.related && props.couldScroll) || props.selected;
	}

	componentWillReceiveProps(nextProps) {

		// was saved by parent element
		if (this.state.dirty && this.props.note.content != nextProps.note.content) {
			this.setState({ dirty: false });
		}

		// became related or selected - scroll to it
		if (!this.props.selected && nextProps.selected) {
			this.scrollAfterUpdate = true;
		} else if (!this.props.related && nextProps.related && nextProps.couldScroll) {
			this.scrollAfterUpdate = true;
		}
	}

	componentDidUpdate() {
		if (this.props.selected) {

			if (this.state.editing) {
				this.editor.focus();
			} else {
				this.pane.focus();
			}

			this.props.selectPane(this.props.note.id);
		}

		if (this.scrollAfterUpdate) {
			this.scrollAfterUpdate = false;
			this._scrollToMe();
		}
	}

	componentDidMount() {
		if (this.props.selected) {
			this.pane.focus();
		}

		if (this.scrollAfterUpdate) {
			this.scrollAfterUpdate = false;
			this._scrollToMe();
		}
	}

	render() {
		const { content } = this.props.note;
		const { editing, dirty } = this.state;
		const { selected, related } = this.props;

		const bemStates = [
			selected ? 'selected' : null,
			related ? 'related' : null,
			editing ? 'editing' : null,
			dirty ? 'dirty' : null
		].filter(it => it);

		const actualPane = (
			<div
				className={bemTool('note-pane', null, bemStates)}
				onClick={this._clickHandler}
				tabIndex="-2"
				ref={this._ref_pane}>

				<div className={bemTool('note-pane', 'viewer', editing ? 'hidden' : null)}>
					<Markdown source={content}/>
				</div>

				{editing &&
				<Editor
					className={bemTool('note-pane', 'editor')}
					content={content}
					ref={this._ref_editor}
					notifyDirty={this.prop_makeDirty}
				/>
				}

				{editing &&
				<div onClick={this._showHideEditor} className={bemTool('note-pane', 'close-button')}><b>✖</b></div>
				}
			</div>
		);

		if (selected) {
			return (
				<HotKeys handlers={this.handlers}>
					{actualPane}
				</HotKeys>
			);
		} else {
			return actualPane;
		}
	}
	//</editor-fold>

	//<editor-fold desc="Private">
	_clickHandler = () => {
		if (!this.props.selected) {
			this.props.relay.setVariables({previewOnly: false});
			this.props.selectPane(this.props.note.id, this);
		} else if (!this.state.editing) {
			this._showHideEditor();
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

	_showHideEditor = () => {
		if (this.state.editing) {
			this.pane.focus();
			this._doSave();
			this.setState({editing: false});
		} else {
			this.setState({editing: true});
		}
	};

	_ref_pane = (ref) => {
		this.pane = ref;
	};

	_ref_editor = (ref) => {
		this.editor = ref;
	};

	_scrollToMe = () => {
		const here = this.pane.offsetTop + this.pane.offsetHeight / 2;
		this.context.scrollToHere(here);
	};
	//</editor-fold>

	//<editor-fold desc="shared">
	prop_makeDirty = () => {
		if (!this.state.dirty) {
			this.props.registerSaveFn(this.props.note.id, this._doSave);
			this.setState({dirty: true});
		}
	};
	//</editor-fold>
}

NotePane.contextTypes = {
	scrollToHere: React.PropTypes.func
};

export default Relay.createContainer(NotePane, {
	initialVariables: {
		previewOnly: true
	},
	fragments: {
		note: () => Relay.QL`fragment on NoteNode { id, content(preview: $previewOnly) }`
	}
});