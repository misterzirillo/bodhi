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
			<div className={bemTool('note-columns', 'note-group', related && 'related')}>
				{this.props.children}
			</div>
		);
	}

}

export default NoteGroup;