/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import bem from '../BemTool';

const LEFT = 'left', RIGHT = 'right', CENTER = 'center';

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
};

export { LEFT, RIGHT, CENTER };