package bodhi

import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.Scalars
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayField
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.annotation.RelayProxyField
import io.cirill.relay.annotation.RelayType
import io.cirill.relay.dsl.GQLFieldSpec
import io.cirill.relay.dsl.GQLMutationSpec
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
@RelayType
class NoteRoot {

	static belongsTo = [ owner: User ]
	static hasMany = [ nodes: NoteNode ]

	static constraints = {
		description nullable: true
		lastEditedNode nullable: true
	}

	Date dateCreated, lastUpdated

	@RelayProxyField
	static lastUpdatedProxy = {
		GQLFieldSpec.field {
			name 'lastUpdated'
			type Scalars.GraphQLLong
			dataFetcher { env ->
				(env.source as NoteRoot).lastUpdated.time
			}
		}
	}

	@RelayField
	Set<NoteNode> nodes = []

	@RelayField
	String name

	@RelayField
	String description

	@RelayField
	NoteNode lastEditedNode

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
				name 'AddNotePayload'

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
				def leftBound = env.arguments.input.leftBound as int

				def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
				def lsr = (sss.currentUser as User).lastSelectedRoot
				lsr.addNoteToHere(leftBound)

				return [
				        lastSelectedRoot: lsr,
						clientMutationId: env.arguments.input.clientMutationId
				]
			}
		}
	}

	private void addNoteToHere(int leftBound) {
		nodes.each { node ->
			if (node.leftBound >= leftBound) {
				node.leftBound += 2
			}
			if (node.rightBound >= leftBound) {
				node.rightBound += 2
			}
		}

		def newNode = new NoteNode(content: '', leftBound: leftBound, rightBound: leftBound + 1, root: this)
		lastEditedNode = newNode
		nodes << newNode
		newNode.save(flush: true)
		save()
	}

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
