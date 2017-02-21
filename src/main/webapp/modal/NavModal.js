/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import bem from '../BemTool';

export default ({ visible, children, position }) => {

	const modifiers = [
		visible && 'visible',
		position
	].filter(it => it);

	return (
		<div className={bem('nav-modal-container', null, modifiers)}>
			<div className={bem('nav-modal-container', 'arrow')} />
			{children}
		</div>
	);
}