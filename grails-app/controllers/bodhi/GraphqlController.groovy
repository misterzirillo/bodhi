package bodhi

import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured

class GraphqlController {

	def relayService

	@Secured('ROLE_USER')
	def index() {
		String query = request.JSON.query.toString()
		Map vars = request.JSON.variables
		def result = relayService.query(query, null, vars)

		render(result as JSON)
	}

	def introspect() {
		render(relayService.introspect() as JSON)
	}

}
