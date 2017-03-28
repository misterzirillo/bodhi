/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import bem from '../utility/BemTool';

const Position = {
	LEFT: 'left', // modal will align with the left side of the toggle
	RIGHT: 'right' // modal will align with the right side of the toggle
};

export default ({ visible, children, position }) => {

	const modifiers = [
		visible && 'visible',
		position
	].filter(it => it);

	return (
		<div className={bem('nav-modal', null, modifiers)}>
			<div className={bem('nav-modal', 'arrow', modifiers)} />
			{children}
		</div>
	);
};

export { Position };