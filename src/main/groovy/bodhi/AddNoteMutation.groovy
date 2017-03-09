package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.dsl.GQLMutationSpec
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
trait AddNoteMutation {

	@RelayMutation
	static addNoteMutation = {
		GQLMutationSpec.field {
			name 'addNote'

			inputType {
				name 'AddNoteInput'
				field {
					name 'leftBound'
					type {
						nonNull Scalars.GraphQLInt
					}
				}
			}

			type {
				name 'AddDeleteNotePayload'

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

				def leftBound = env.arguments.input.leftBound as int
				lsr.addNoteHere(leftBound)

				[
						lastSelectedRoot: lsr,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}
		}
	}

}