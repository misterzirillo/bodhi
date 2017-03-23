/**
 * Created by mcirillo on 3/21/17.
 */

import React from 'react';
import bem from './BemTool';

export default ({ children, visible, onBackgroundClick }) => {
	return (
		<div className={bem('global-modal', null, visible && 'visible')}>
			<div className={bem('global-modal', 'background')} onClick={onBackgroundClick} />
			<div className={bem('global-modal', 'dialog')}>
				{children}
			</div>
		</div>
	);
};
