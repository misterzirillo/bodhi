package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.dsl.GQLMutationSpec

/**
 * bodhi
 * @author mcirillo
 */
trait DeleteNoteMutation {

	@RelayMutation
	static deleteNoteMutation = {
		GQLMutationSpec.field {
			name 'deleteNote'

			inputType {
				name 'DeleteNoteInput'
				field {
					name 'nodeId'
					type {
						nonNull Scalars.GraphQLID
					}
				}
			}

			type {
				ref 'AddDeleteNotePayload'
			}

			dataFetcher { env ->
				def id = RelayHelpers.fromGlobalId(env.arguments.input.nodeId as String).id as long

				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
				def lsr = (sss.currentUser as User).lastSelectedRoot
				lsr.deleteNoteFromHere(id)

				return [
						lastSelectedRoot: lsr,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}
		}
	}

}