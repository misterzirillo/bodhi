package bodhi.schema

import spock.lang.Specification

/**
 * bodhi
 * @author mcirillo
 */
class SchemaTest extends Specification {

	def "get schema"() {
		expect:
		Schema.schema != null
	}
}
