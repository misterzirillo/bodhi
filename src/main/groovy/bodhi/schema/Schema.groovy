package bodhi.schema

import bodhi.GraphQLHelpers
import bodhi.NoteNode
import bodhi.NoteRoot
import gql.DSL
import graphql.schema.DataFetchingEnvironment
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLInterfaceType
import graphql.schema.GraphQLNonNull
import graphql.schema.GraphQLSchema
import groovy.json.JsonOutput

import static bodhi.schema.Node.*
import static bodhi.schema.Root.*
import static bodhi.schema.User.*

/**
 * bodhi
 * @author mcirillo
 */
class Schema {

	@Lazy
	final static GraphQLSchema schema = DSL.schema {
		queries {
			addField userQuery

			// groovy bug? full (this) reference needed for local static fields when using @Lazy
			addField GraphQLHelpers.nodeField(this.nodeInterface, this.nodeDataFetcher)
		}

		mutations {
			addField textUpdate
			addField addNote
			addField deleteNote
			addField moveNote
			addField switchRoot
			addField addRoot
		}
	}

	final static GraphQLFieldDefinition idField = DSL.field('id') {
		type new GraphQLNonNull(GraphQLID)
		fetcher { env ->
			GraphQLHelpers.toGlobalId(env.getSource().class.simpleName, env.getSource().id as String)
		}
	}

	final static GraphQLInterfaceType nodeInterface = GraphQLHelpers.nodeInterface { env ->
		switch (GraphQLHelpers.fromGlobalId(env.arguments.id).type) {
			case "User":
				return user
			case "NoteRoot":
				return root
			case "NoteNode":
				return node
			default:
				throw new Error("Bad ID")
		}
	}

	final static def nodeDataFetcher = { DataFetchingEnvironment environment ->
		def decoded = GraphQLHelpers.fromGlobalId(environment.arguments.id as String)
		def domainType

		switch (decoded.type) {
			case "User":
				domainType = bodhi.User
				break
			case "NoteRoot":
				domainType = NoteRoot
				break
			case "NoteNode":
				domainType = NoteNode
				break
			default:
				throw new Exception("Bad ID")
		}

		domainType.get(decoded.id)
	}

	public static String introspect() {
		JsonOutput.toJson DSL.execute(schema, GraphQLHelpers.INTROSPECTION_QUERY)
	}
}

