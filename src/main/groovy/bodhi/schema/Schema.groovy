package bodhi.schema

import bodhi.GraphQLHelpers
import gql.DSL
import graphql.schema.GraphQLSchema

/**
 * bodhi
 * @author mcirillo
 */
class Schema implements Root, Node, User {

	final static GraphQLSchema schema = DSL.schema {
		queries {
			addField gqlUserQuery
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

	final static nodeInterface = GraphQLHelpers.nodeInterface { env ->
		Schema."schema$env.fieldType.name"
	}

}
