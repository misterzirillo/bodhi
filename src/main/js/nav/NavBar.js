/**
 * Created by mcirillo on 2/19/17.
 */
import React from 'react';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay/compat';
import bem from '../utility/BemTool';

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

export default createFragmentContainer(NavBar, {
    user: graphql`
        fragment NavBar_user on User { 
        
            username,
            
            ...NoteRootPicker_user
            ...UserMenu_user
        }`
});