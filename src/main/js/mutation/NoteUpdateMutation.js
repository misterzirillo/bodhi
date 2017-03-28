/**
 * Created by mcirillo on 1/19/17.
 */

import Relay, { Mutation } from 'react-relay';

export default class NoteUpdateMutation extends Mutation {

	getMutation() {
		return Relay.QL`mutation { textUpdate }`;
	}

	getVariables() {
		return { nodeId: this.props.nodeId, patch: this.props.patch };
	}

	getConfigs() {
		return [
			{
				type: 'FIELDS_CHANGE',
				fieldIDs: {
					updatedNode: this.props.nodeId
				}
			},
		];
	}

	getFatQuery() {
		return Relay.QL`
		fragment on TextInputPayload { 
			updatedNode { content(preview: false) }
		}`;
	}
}