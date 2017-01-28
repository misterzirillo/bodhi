/**
 * Created by mcirillo on 1/22/17.
 */

import React from 'react';
import bemTool from '../BemTool';

export default ({ children, related }) => {
	return (
		<div className={bemTool('note-columns', 'note-group', related && 'related')}>
			{children}
		</div>
	);
}