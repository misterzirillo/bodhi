import React, { Component } from 'react';
import Relay from 'react-relay';
import bemTool from '../BemTool';
import Markdown from 'react-remarkable';
import Editor from './NoteEditor';
import NoteUpdateMutation from './NoteUpdateMutation';
import { HotKeys } from 'react-hotkeys';

class NotePane extends Component {

	//<editor-fold desc="Static">
	static contextTypes = {
		scrollToHere: React.PropTypes.func
	};
	//</editor-fold>

	//<editor-fold desc="Component Lifecycle">
	constructor(props) {
		super(props);

		this.state = {
			editing: !props.node, // the editor for this note is enable/disabled
			dirty: false
		};

		if (props.selected || props.related) {
			this.props.relay.setVariables({previewOnly: false});
		}

		this.handlers = {
			'close-open-editor': () => this._showHideEditor
		};

		this.scrollAfterUpdate = props.selected;
	}

	componentWillReceiveProps(nextProps) {

		// was saved by parent element
		if (this.state.dirty && this.props.node.content != nextProps.node.content) {
			this.setState({ dirty: false });
		}

		// becoming selected/related
		if (nextProps.related || nextProps.selected) {
			this._getFullContentIfNeeded();
		}

		// became related or selected - scroll to it
		if (!this.props.selected && nextProps.selected) {
			this.scrollAfterUpdate = true;
		} else if (!this.props.related && nextProps.related) {
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

			//this.props.selectNode(this.props.node.id);
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
		const { selected, related, node } = this.props;
		const { editing, dirty } = this.state;
		const content = node ? node.content : '';

		const bemStates = [
			selected ? 'selected' : null,
			related ? 'related' : null,
			editing ? 'editing' : null,
			dirty ? 'dirty' : null
		].filter(it => it);

		const actualPane = (
			<div
				className={bemTool('note-pane', null, bemStates)}
				onClick={this._event_onClick}
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
	_getFullContentIfNeeded = () => {
		if (this.props.relay.variables.previewOnly) {
			this.props.relay.setVariables({previewOnly: false});
		}
	};

	_doSave = () => {
		if (this.state.dirty) {
			const newContent = this.editor.getValue();
			if (this.props.node.content != newContent) {
				const mutation = new NoteUpdateMutation({
					nodeId: this.props.node.id,
					patch: this.editor.getValue()
				});
				this.props.relay.commitUpdate(mutation);
			}
		}
	};

	_showHideEditor = () => {
		if (this.state.editing) {
			this.pane.focus();
			this.setState({editing: false});
		} else {
			this.setState({editing: true});
		}
	};

	_scrollToMe = () => {
		const here = this.pane.offsetTop + this.pane.offsetHeight / 2;
		this.context.scrollToHere(here);
	};
	//</editor-fold>

	//<editor-fold desc="JSX Bindings (refs, events)">
	_ref_pane = (ref) => {
		this.pane = ref;
	};

	_ref_editor = (ref) => {
		this.editor = ref;
	};

	_event_onClick = () => {
		if (!this.props.selected) {
			this.props.selectNode(this.props.node.id);
		} else if (!this.state.editing) {
			this._showHideEditor();
		}
	};
	//</editor-fold>

	//<editor-fold desc="Shared">
	prop_makeDirty = () => {
		if (!this.state.dirty) {
			this.props.registerSaveFn(this.props.node.id, this._doSave);
			this.setState({dirty: true});
		}
	};
	//</editor-fold>
}

export default Relay.createContainer(NotePane, {
	initialVariables: {
		previewOnly: true
	},
	fragments: {
		node: () => Relay.QL`fragment on NoteNode { id, content(preview: $previewOnly) }`
	}
});