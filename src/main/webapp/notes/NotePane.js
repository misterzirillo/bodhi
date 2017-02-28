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
			editing: false,
			dirty: false
		};

		if (props.selected || props.related) {
			this.props.relay.setVariables({previewOnly: false});
		}

		this.scrollAfterUpdate = (props.selected || props.related) && props.shouldScroll;
	}

	shouldComponentUpdate(nextProps, nextState) {
		const becameSelected = this.props.selected != nextProps.selected;
		const becameRelated = this.props.related != nextProps.related;

		const differentRelay = this.props.relay.variables.previewOnly != nextProps.relay.variables.previewOnly;
		const differentId = this.props.node.id != nextProps.node.id;

		const editing = this.state.editing != nextState.editing;
		const dirty = this.state.dirty != nextState.dirty;

		return becameRelated || becameSelected || differentRelay || editing || dirty || differentId;
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

		// became selected - pass ref to root
		if (nextProps.selected) {
			this.props.refWhenSelected(this);

			if (this.state.editing) {
				this.editor.focus();
			}
		}

		// became related or selected - scroll to it
		if (nextProps.shouldScroll) {
			this.scrollAfterUpdate = true;
		}
	}

	componentDidUpdate() {
		if (this.scrollAfterUpdate && !this.props.relay.variables.previewOnly) {
			this.scrollAfterUpdate = false;
			this._scrollToMe();
		}
	}

	componentDidMount() {
		if (this.props.selected) {
			this.props.refWhenSelected(this);
		}

		if (this.scrollAfterUpdate) {
			this.scrollAfterUpdate = false;
			this._scrollToMe();
		}
	}

	render() {
		const { selected, related, node } = this.props;
		const { editing, dirty } = this.state;
		const { previewOnly } = this.props.relay.variables;
		const content = node ? node.content : '';

		const blockModifiers = [
			selected ? 'selected' : null,
			related ? 'related' : null,
			editing ? 'editing' : null,
			dirty ? 'dirty' : null
		].filter(it => it);

		const viewerModifiers = [
			editing ? 'hidden' : null,
			previewOnly ? 'preview' : null
		].filter(it => it);

		return (
			<div
				className={bemTool('note-pane', null, blockModifiers)}
				onClick={this._event_onClick}
				ref={this._ref_pane}
			>

				<div className={bemTool('note-pane', 'viewer', viewerModifiers)}>
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
					<div onClick={this._showHideEditor} className={bemTool('note-pane', 'close-button')}>
						<i className="fa fa-check"/>
					</div>
				}
			</div>
		);
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
			this._doSave();
			this.setState({editing: false});
			return false;
		} else {
			this.setState({editing: true});
			return true;
		}
	};

	_scrollToMe = () => {
		const here = this.pane.offsetTop + this.pane.offsetHeight / 2;
		this.context.scrollToHere(here);
	};

	_doIfNotEditing = (fn) => {
		if (!this.state.editing)
			fn();
	};
	//</editor-fold>

	//<editor-fold desc="JSX Bindings (refs, events)">
	_ref_pane = (ref) => {
		this.pane = ref;
	};

	_ref_editor = (ref) => {
		this.editor = ref;
	};

	_event_onClick = (e) => {
		if (!this.props.selected) {
			this.props.selectNode(this.props.node.id);
		} else if (!this.state.editing && !e.target.href) {
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
