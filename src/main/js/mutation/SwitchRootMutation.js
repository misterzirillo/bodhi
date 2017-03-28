/**
 * Created by mcirillo on 2/19/17.
 */

import Relay from 'react-relay';

export default class SwitchRootMutation extends Relay.Mutation {

	getMutation() {
		return Relay.QL`mutation { switchRoot }`;
	}

	getVariables() {
		return { newRootId: this.props.newRootId, currentUserId: this.props.currentUserId };
	}

	getConfigs() {
		return [
			{
				type: 'FIELDS_CHANGE',
				fieldIDs: {
					user: this.props.currentUserId
				}
			}
		];
	}

	getFatQuery() {
		return Relay.QL`
			fragment on SwitchRootPayload {
				user {
					lastSelectedRoot
				}
			}
		`;
	}

}