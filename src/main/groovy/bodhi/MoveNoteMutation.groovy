package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import graphql.schema.GraphQLTypeReference
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.dsl.GQLMutationSpec
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
trait MoveNoteMutation {

	@RelayMutation
	static moveNote = {
		GQLMutationSpec.field {

			name 'moveNote'

			inputType {
				name 'MoveNoteInput'
				field {
					name 'movingNodeId'
					type {
						nonNull Scalars.GraphQLID
					}
				}
				field {
					name 'targetNodeId'
					type {
						nonNull Scalars.GraphQLID
					}
				}
				field {
					name 'moveMode'
					type {
						nonNull new GraphQLTypeReference('MoveMode')
					}
				}
			}

			type {
				name 'MoveNotePayload'
				field {
					name 'clientMutationId'
					type Scalars.GraphQLString
				}
				field {
					name 'lastSelectedRoot'
					type {
						ref 'NoteRoot'
					}
				}
			}

			dataFetcher { env ->
				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService

				def lsr = NoteRoot.withCriteria {
					idEq(sss.currentUser.lastSelectedRoot.id)
					fetchMode 'nodes', FetchMode.SELECT
				}.first() as NoteRoot

				def movingNodeId = RelayHelpers.fromGlobalId(env.arguments.input.movingNodeId as String).id as long
				def targetNodeId = RelayHelpers.fromGlobalId(env.arguments.input.targetNodeId as String).id as long
				def moveMode = env.arguments.input.moveMode as NoteRoot.MoveMode

				lsr.moveNote movingNodeId, targetNodeId, moveMode

				[
				        lastSelectedRoot: lsr,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}
		}
	}

}