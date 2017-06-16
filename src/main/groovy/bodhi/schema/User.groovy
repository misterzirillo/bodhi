package bodhi.schema

import bodhi.GraphQLHelpers
import bodhi.NoteRoot
import gql.DSL
import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLList
import graphql.schema.GraphQLNonNull
import graphql.schema.GraphQLObjectType
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
class User {

	final static GraphQLObjectType user = DSL.type('User') {

		field 'username', GraphQLString
		field 'lastSelectedRoot', Root.root
		field 'rootNodes', new GraphQLList(Root.root)

		addField Schema.idField
		addInterface Schema.nodeInterface
	}

	final static GraphQLFieldDefinition userQuery = DSL.field('currentUser') {
		type user
		fetcher { env ->
			def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
			def eagerLoad = GraphQLHelpers.eagerFetchStrings(env)
			bodhi.User.withCriteria {
				idEq(sss.currentUserId)
				for (def str : eagerLoad) {
					fetchMode str, FetchMode.JOIN
				}
			}.first()
		}
	}

	final static GraphQLFieldDefinition switchRoot = DSL.field('switchRoot') {

		argument 'input', DSL.input('SwitchRootInput') {
			field 'clientMutationId', GraphQLString
			field 'newRootId', new GraphQLNonNull(GraphQLID)
		}

		type DSL.type('SwitchRootPayload') {
			field 'clientMutationId', GraphQLString
			field 'user', new GraphQLNonNull(user)
		}

		fetcher { env ->
			def id = GraphQLHelpers.fromGlobalId(env.arguments.input.newRootId).id as long
			def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
			def user = sss.currentUser as bodhi.User

			def newRoot = Root.withCriteria {
				idEq(id)
				for (def str : ['nodes', 'nodes.content', 'nodes.id', 'nodes.leftBound', 'nodes.rightBound']) {
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

	final static GraphQLFieldDefinition addRoot = DSL.field('addRoot') {

		argument 'input', DSL.input('AddRootInput') {
			field 'clientMutationId', GraphQLString
			field 'newRootName', new GraphQLNonNull(GraphQLString)
			field 'newRootDescription', GraphQLString
		}

		type DSL.type('AddRootPayload') {
			field 'clientMutationId', GraphQLString
			field 'currentUser', new GraphQLNonNull(user)
		}

		fetcher { env ->
			def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
			def user = sss.currentUser as bodhi.User

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
