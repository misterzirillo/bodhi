/**
 * Created by mcirillo on 2/4/17.
 */

import Relay, { Mutation } from 'react-relay';

export default class AddNoteMutation extends Mutation {

	static fragments = {
		lastSelectedRoot: () => Relay.QL`fragment on NoteRoot { id }`
	};

	getMutation() {
		return Relay.QL`mutation { addNote }`;
	}

	getVariables() {
		return {
			leftBound: this.props.leftBound
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
		fragment on AddNotePayload {
			lastSelectedRoot {
				id,
				lastEditedNote {
					id
				},
				nodes {
					leftBound, rightBound
				}
			}
		}`;
	}
}
