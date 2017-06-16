package bodhi.schema

import bodhi.GraphQLHelpers
import gql.DSL
import graphql.Scalars
import graphql.schema.DataFetchingEnvironment
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLInterfaceType
import graphql.schema.GraphQLNonNull
import graphql.schema.GraphQLSchema

import static bodhi.schema.Node.getTextUpdate
import static bodhi.schema.Root.*
import static bodhi.schema.User.*

/**
 * bodhi
 * @author mcirillo
 */
class Schema {

	final static GraphQLSchema schema = DSL.schema {
		queries {
			addField userQuery
			addField GraphQLHelpers.nodeField(nodeInterface, nodeDataFetcher)
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

	@Lazy
	final static GraphQLFieldDefinition idField = DSL.field('id') {
		type new GraphQLNonNull(Scalars.GraphQLID)
		fetcher { env ->
			GraphQLHelpers.toGlobalId(env.getSource().class.simpleName, env.getSource().id as String)
		}
	}

	@Lazy
	final static GraphQLInterfaceType nodeInterface = GraphQLHelpers.nodeInterface { env ->
		Schema."schema$env.fieldType.name"
	}

	@Lazy
	final static def nodeDataFetcher = { DataFetchingEnvironment environment ->
		def decoded = GraphQLHelpers.fromGlobalId(environment.arguments.id as String)
		def domainType

		switch (decoded.type) {
			case "User":
				domainType = bodhi.User
				break
			case "Root":
				domainType = bodhi.Root
				break
			case "Node":
				domainType = bodhi.Node
				break
			default:
				throw new Exception("Bad type")
		}

		domainType.get(decoded.id)
	}
}

