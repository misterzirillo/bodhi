/**
 * Created by mcirillo on 3/3/17.
 */

import Relay, { Mutation } from 'react-relay/classic';

export default class MoveNodeMutation extends Mutation {

	static MoveMode = {
		BEFORE: 'Before',
		AFTER: 'After'
	};

	static fragments = {
		lastSelectedRoot: () => Relay.QL`fragment on Root { id }`
	};

	getMutation() {
		return Relay.QL`mutation { moveNote }`;
	}

	getVariables() {
		return {
			movingNodeId: this.props.movingNodeId,
			targetNodeId: this.props.targetNodeId,
			moveMode: this.props.moveMode
		};
	}

	getConfigs() {
		return [
			{
				type: 'FIELDS_CHANGE',
				fieldIDs: {
					lastSelectedRoot: this.props.lastSelectedRoot.id
				}
			}
		];
	}

	getFatQuery() {
		return Relay.QL`
		fragment on MoveNotePayload {
			lastSelectedRoot {
				lastUpdated,
				lastEditedNode {
					id
				},
				nodes {
					leftBound, rightBound
				}
			}
		}`;
	}
}
