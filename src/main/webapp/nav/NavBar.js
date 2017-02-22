/**
 * Created by mcirillo on 2/19/17.
 */
import React from 'react';
import Relay from 'react-relay';
import bem from '../BemTool';

const NavBar = ({ children, user }) => {
	return (
		<div className={bem('nav-bar')}>
			<div className={bem('nav-bar', 'container')}>
				<div className={bem('nav-bar', 'title')}>
					<i className="fa fa-cubes"/>
					<b>Bodhi</b>
				</div>
				{children}
				<div className={bem('nav-bar', 'username')}>{user.username}</div>
			</div>
		</div>
	);
};

export default Relay.createContainer(NavBar, {
	fragments: {
		user: () => Relay.QL`fragment on User { username }`
	}
});