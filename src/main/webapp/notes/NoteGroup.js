/**
 * Created by mcirillo on 1/22/17.
 */

import React from 'react';
import bemTool from '../BemTool';

class NoteGroup extends React.PureComponent {

	constructor(props) {
		super(props);
		this.lastSelectedNote = null;
	}

	componentWillReceiveProps(nextProps) {
		const nodeProps = React.Children.map(nextProps.children, (child) => ({...child.props}));
		if (nodeProps.some(props => props.selected)) {
			this.lastSelectedNote = nodeProps.find(props => props.selected).note.id;
		} else if (this._shouldScrollGroup(nodeProps)) {
			this._scrollToMe();
		}
	}

	//<editor-fold desc="private">
	_scrollToMe = () => {
		const here = this.el.offsetTop + this.el.offsetHeight / 2;
		this.context.scrollToHere(here);
	};

	_ref_el = (ref) => {
		this.el = ref;
	};

	_shouldScrollGroup = (nodeProps) => {
		const anyHaveBeenSelectedBefore = nodeProps.some(props => props.note.id == this.lastSelectedNote);
		const allAreRelated = nodeProps.every(props => props.related);
		const onlyOne = nodeProps.length == 1;
		return !onlyOne && allAreRelated && !anyHaveBeenSelectedBefore;
	};
	//</editor-fold>

	render() {
		const shouldScrollToGroup = this._shouldScrollGroup(React.Children.map(this.props.children,
			(child) => ({...child.props}))
		);

		return (
			<div className={bemTool('note-columns', 'note-group')} ref={this._ref_el}>
				{React.Children.map(this.props.children, (child) => {
					return React.cloneElement(child, {
						couldScroll: !shouldScrollToGroup
					});
				})}
			</div>
		);
	}
}

NoteGroup.contextTypes = {
	scrollToHere: React.PropTypes.func
};

export default NoteGroup;