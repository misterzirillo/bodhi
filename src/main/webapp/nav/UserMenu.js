/**
 * Created by mcirillo on 3/1/17.
 */

import React from 'react';
import Relay from 'react-relay';
import bem from '../BemTool';

import NavModal, { Position } from './NavModal';

class UserMenu extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			expanded: false
		}
	}

	event_toggleModal = () => {
		this.setState({
			expanded: !this.state.expanded
		});
	};

	render() {

		const expanded = this.state.expanded;
		const { user } = this.props;

		return (
			<div
				onClick={this.event_toggleModal}
				className={[
					bem('nav-bar', 'modal-toggle', expanded && 'toggled'),
					bem('user-menu', null, expanded && 'toggled')
				].join(' ')}
			>

				<span className={bem('nav-bar', 'username')}>
					{user.username}
				</span>

				<i className="fa fa-ellipsis-h"/>

				<NavModal visible={expanded} position={Position.RIGHT}>
					<div className={bem('user-menu', 'modal')}>
						<a target="_self" href='/logout'>Log Out</a>
					</div>
				</NavModal>

			</div>
		);
	}

}

export default Relay.createContainer(UserMenu, {
	fragments: {
		user: () => Relay.QL`
			fragment on User {
				username
			}
		`
	}
});