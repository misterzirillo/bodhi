/**
 * Created by mcirillo on 3/3/17.
 */

import Relay, { Mutation } from 'react-relay';

export default class MoveNodeMutation extends Mutation {

	static MoveMode = {
		BEFORE: 'Before',
		AFTER: 'After'
	};

	static fragments = {
		lastSelectedRoot: () => Relay.QL`fragment on NoteRoot { id }`
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
