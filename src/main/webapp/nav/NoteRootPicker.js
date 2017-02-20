/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import Relay from 'react-relay';
import bem from '../BemTool';

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

	render() {

		const { lastSelectedRoot, rootNodes } = this.props.user;
		const { selecting } = this.state;

		return (
			<div onClick={this.event_onClick} className={bem('root-picker', null, selecting && 'selecting')}>
				<span className={bem('root-picker', 'current-root')}>{lastSelectedRoot.name}</span>
				<i className="fa fa-angle-down"/>
			</div>
		);
	}

}

export default Relay.createContainer(NoteRootPicker, {

	fragments: {
		user: () => Relay.QL`
			fragment on User {
				lastSelectedRoot {
					name
				}
				rootNodes {
					id,
					name
				}
			}
		`
	}

});