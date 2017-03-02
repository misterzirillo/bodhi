/**
 * Created by mcirillo on 2/19/17.
 */
import React from 'react';
import Relay from 'react-relay';
import bem from '../BemTool';

import NoteRootPicker from './NoteRootPicker';
import UserMenu from './UserMenu';

const NavBar = ({ user }) => {
	return (
		<div className={bem('nav-bar')}>

			<div className={bem('nav-bar', 'title')}>
				<b>Bodhi</b>
				<i className="fa fa-leaf"/>
			</div>

			<NoteRootPicker user={user}/>
			<UserMenu user={user}/>

		</div>
	);
};

export default Relay.createContainer(NavBar, {
	fragments: {
		user: () => Relay.QL`
			fragment on User { 
			
				username,
				
				${NoteRootPicker.getFragment('user')}
				${UserMenu.getFragment('user')}
			}`
	}
});