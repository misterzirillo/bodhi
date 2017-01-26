/**
 * Created by mcirillo on 1/22/17.
 */

import React from 'react';
import bemTool from '../BemTool';

class NoteGroup extends React.Component {

	componentDidUpdate(prevProps) {
		if (!prevProps.related && this.props.related) {
			// TODO scroll to me
		}
	}

	render() {
		const { related } = this.props;
		return (
			<div className={related ? bemTool('note-group', null, 'related') : bemTool('NoteGroup')}>
				{this.props.children}
			</div>
		);
	}

}

export default NoteGroup;