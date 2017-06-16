package bodhi

import gql.DSL
import graphql.schema.GraphQLTypeReference
import spock.lang.Specification

/**
 * bodhi
 * @author mcirillo
 */
class GraphQLHelpersTest extends Specification {

	def "EagerFetchStrings"() {

		setup:
		def strings = []
		def schema = DSL.schema {
			queries {
				field('jeff') {
					type DSL.type('Person') {
						field 'name', GraphQLString
						field 'son', new GraphQLTypeReference('Person')
					}

					fetcher { env ->
						strings = GraphQLHelpers.eagerFetchStrings env
						null
					}
				}
			}
		}

		when:
		DSL.execute(schema, """
		query {
			jeff {
				son {   
					... on Person {
						name
					}
				}
			}
		}
		""")

		then:
		strings == [ 'son', 'son.name' ]
	}

}
