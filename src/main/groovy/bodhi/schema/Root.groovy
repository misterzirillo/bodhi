package bodhi.schema

import bodhi.GraphQLHelpers
import bodhi.NoteRoot
import bodhi.User
import gql.DSL
import grails.plugin.springsecurity.SpringSecurityService
import grails.util.Holders
import graphql.schema.GraphQLEnumType
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLList
import graphql.schema.GraphQLNonNull
import graphql.schema.GraphQLObjectType
import graphql.schema.GraphQLTypeReference
import org.hibernate.FetchMode

/**
 * bodhi
 * @author mcirillo
 */
class Root {

	final static GraphQLObjectType root = DSL.type('Root') {

		field 'nodes', new GraphQLList(Node.node)
		field 'name', GraphQLString
		field 'description', GraphQLString
		field 'lastEditedNode', Node.node

		field 'lastUpdated', {
			type GraphQLLong
			fetcher { env ->
				(env.source as NoteRoot).lastUpdated.time
			}
		}

		addField Schema.idField
		addInterface Schema.nodeInterface
	}

	final static GraphQLFieldDefinition addNote = DSL.field('addNote') {

		argument 'input', DSL.input('AddNoteInput') {
			field 'clientMutationId', GraphQLString
			field 'leftBound', new GraphQLNonNull(GraphQLInt)
		}

		type DSL.type('AddDeleteNotePayload') {
			field 'clientMutationId', GraphQLString
			field 'lastSelectedRoot', root
		}

		fetcher { env ->
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

	final static GraphQLFieldDefinition deleteNote = DSL.field("deleteNote") {

		argument 'input', DSL.input('DeleteNoteInput') {
			field 'clientMutationId', GraphQLString
			field 'nodeId', new GraphQLNonNull(GraphQLID)
		}

		type new GraphQLTypeReference('AddDeleteNotePayload')

		fetcher { env ->
			def id = GraphQLHelpers.fromGlobalId(env.arguments.input.nodeId as String).id as long

			def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService
			def lsr = (sss.currentUser as User).lastSelectedRoot
			lsr.deleteNoteFromHere(id)

			return [
					lastSelectedRoot: lsr,
					clientMutationId: env.arguments.input.clientMutationId
			]
		}
	}

	final static GraphQLEnumType moveMode = DSL.enum('MoveMode') {
		value 'Before', NoteRoot.MoveMode.Before
		value 'After', NoteRoot.MoveMode.After
	}

	final static GraphQLFieldDefinition moveNote = DSL.field('moveNote') {

		argument 'input', DSL.input('MoveNoteInput') {
			field 'clientMutationId', GraphQLString
			field 'movingNodeId', new GraphQLNonNull(GraphQLID)
			field 'targetNodeId', new GraphQLNonNull(GraphQLID)
			field 'moveMode', new GraphQLNonNull(moveMode)
		}

		type DSL.type('MoveNotePayload') {
			field 'clientMutationId', GraphQLString
			field 'lastSelectedRoot', root
		}

		fetcher { env ->
			def sss = Holders.applicationContext.getBean('springSecurityService') as SpringSecurityService

			def lsr = NoteRoot.withCriteria {
				idEq(sss.currentUser.lastSelectedRoot.id)
				fetchMode 'nodes', FetchMode.SELECT
			}.first() as NoteRoot

			def movingNodeId = GraphQLHelpers.fromGlobalId(env.arguments.input.movingNodeId as String).id as long
			def targetNodeId = GraphQLHelpers.fromGlobalId(env.arguments.input.targetNodeId as String).id as long
			def moveMode = env.arguments.input.moveMode as NoteRoot.MoveMode

			lsr.moveNote movingNodeId, targetNodeId, moveMode

			[
			        lastSelectedRoot: lsr,
					clientMutationId: env.arguments.input.clientMutationId
			]
		}
	}
}
