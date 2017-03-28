package bodhi

import bodhi.schema.Schema
import gql.DSL
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured

class GraphqlController {

	@Secured('ROLE_USER')
	def index() {
		String query = request.JSON.query
		Map vars = request.JSON.variables
		def result = DSL.execute Schema.schema, query, vars

		render(result as JSON)
	}

	def introspect() {
		render(DSL.execute(Schema.schema, GraphQLHelpers.INTROSPECTION_QUERY) as JSON)
	}
}
