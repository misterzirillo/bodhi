package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.dsl.GQLMutationSpec
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
trait SwitchRootMutation {

	@RelayMutation
	static switchRoot = {
		GQLMutationSpec.field {
			name 'switchRoot'

			inputType {
				name 'SwitchRootInput'
				field {
					name 'newRootId'
					type {
						nonNull Scalars.GraphQLID
					}
				}
			}

			type {
				name 'SwitchRootPayload'
				field {
					name 'clientMutationId'
					type Scalars.GraphQLString
				}
				field {
					name 'user'
					type {
						ref 'User'
					}
				}
			}

			dataFetcher { env ->
				def id = RelayHelpers.fromGlobalId(env.arguments.input.newRootId).id as long
				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
				def user = sss.currentUser as User

				def newRoot = NoteRoot.withCriteria {
					idEq(id)
					for (def str : ['nodes', 'nodes.content', 'nodes.id', 'nodes.leftBound', 'nodes.rightBound']){
						fetchMode str, FetchMode.JOIN
					}
				}.first()

				user.lastSelectedRoot = newRoot
				user.save()

				[
						user: user,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}
		}
	}

}