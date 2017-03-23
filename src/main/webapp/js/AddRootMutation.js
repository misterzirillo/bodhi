/**
 * Created by mcirillo on 3/21/17.
 */

import Relay from 'react-relay';

export default class AddRootMutation extends Relay.Mutation {

	static fragments = {
		user: () => Relay.QL`fragment on User { id }`
	};

	getMutation() {
		return Relay.QL`mutation { addRoot }`;
	}

	getVariables() {
		return {
			newRootName: this.props.newRootName,
			newRootDescription: this.props.newRootDescription
		};
	}

	getConfigs() {
		return [
			{
				type: 'FIELDS_CHANGE',
				fieldIDs: {
					currentUser: this.props.user.id
				}
			}
		];
	}

	getFatQuery() {
		return Relay.QL`
		fragment on AddRootPayload {
			currentUser {
				lastSelectedRoot, 
				rootNodes { id }
			}
		}`;
	}

}