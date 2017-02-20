/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import bem from '../BemTool';

export default ({ visible, children }) => {
	return (
		<div className={bem('modal', null, visible && 'visible')}>
			{children}
		</div>
	);
}