package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.dsl.GQLMutationSpec

/**
 * bodhi
 * @author mcirillo
 */
trait AddRootMutation {

	@RelayMutation
	static addRoot = {
		GQLMutationSpec.field {

			name 'addRoot'

			inputType {
				name 'AddRootInput'
				field {
					name 'newRootName'
					type {
						nonNull Scalars.GraphQLString
					}
				}
				field {
					name 'newRootDescription'
					type Scalars.GraphQLString
				}
			}

			type {
				name 'AddRootPayload'
				field {
					name 'clientMutationId'
					type Scalars.GraphQLString
				}
				field {
					name 'currentUser'
					type {
						nonNull {
							ref 'User'
						}
					}
				}
			}

			dataFetcher { env ->
				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
				def user = sss.currentUser as User

				def rootName = env.arguments.input.newRootName as String
				def rootDescription = env.arguments.input.newRootDescription as String

				def newRoot = new NoteRoot(owner: user, name: rootName, description: rootDescription).save()
				user.lastSelectedRoot = newRoot

				return [
				        currentUser: user,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}

		}
	}

}