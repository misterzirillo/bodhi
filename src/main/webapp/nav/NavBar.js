/**
 * Created by mcirillo on 2/19/17.
 */
import React from 'react';
import bem from '../BemTool';

export default ({ children }) => {
	return (
		<div className={bem('nav-bar')}>
			<div className={bem('nav-bar', 'container')}>
				<i className="fa fa-cubes"/>
				<div className={bem('nav-bar', 'title')}>
					<b>Bodhi</b>
				</div>
				{children}
			</div>
		</div>
	);
};