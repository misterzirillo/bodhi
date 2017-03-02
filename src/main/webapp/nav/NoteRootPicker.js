/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import Relay from 'react-relay';
import bem from '../BemTool';

import NavModal, { Position } from './NavModal';
import SwitchRootMutation from './SwitchRootMutation';

class NoteRootPicker extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selecting: false
		}
	}

	event_onClick = () => {
		this.setState({ selecting: !this.state.selecting });
	};

	event_onClickRoot = (id) => {
		const mutation = new SwitchRootMutation({ newRootId: id, currentUserId: this.props.user.id  });
		this.props.relay.commitUpdate(mutation);
	};

	render() {

		const { lastSelectedRoot, rootNodes } = this.props.user;
		const { selecting } = this.state;

		return (
			<div
				onClick={this.event_onClick}
				className={[
					bem('root-picker', null, selecting && 'selecting'),
					bem('nav-bar', 'modal-toggle', selecting && 'toggled')
				].join(' ')}
			>
				<span className={bem('root-picker', 'current-root')}>
					{lastSelectedRoot.name}
				</span>

				<i className="fa fa-angle-down"/>

				<NavModal visible={selecting} position={Position.LEFT}>
					<div className={bem('root-picker', 'modal')}>
						{rootNodes.map(node => (
							<div
								className={bem('root-picker', 'root-selection')}
								key={node.id}
								onClick={() => this.event_onClickRoot(node.id)}
							>
								<span className="name">{node.name}</span>
								<span className={bem('root-picker', 'root-selection-last-update')}>
									(last updated {new Date(node.lastUpdated).toLocaleString()})
								</span>
							</div>
						))}
					</div>
				</NavModal>
			</div>
		);
	}

}

export default Relay.createContainer(NoteRootPicker, {

	fragments: {
		user: () => Relay.QL`
			fragment on User {
			
				id,
			
				lastSelectedRoot {
					name
				},
				
				rootNodes {
					id,
					name,
					lastUpdated
				}
			}
		`
	}

});