package bodhi

import graphql.language.Field
import graphql.language.FragmentSpread
import graphql.language.InlineFragment
import graphql.language.SelectionSet
import graphql.relay.Relay
import graphql.schema.DataFetcher
import graphql.schema.DataFetchingEnvironment
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLInterfaceType
import graphql.schema.TypeResolver
import groovy.transform.CompileStatic

/**
 * bodhi
 * @author mcirillo
 */
@CompileStatic
class GraphQLHelpers {

	private static Relay relay = new Relay()

	static String toGlobalId(String type, String id) {
		relay.toGlobalId(type, id)
	}

	static Relay.ResolvedGlobalId fromGlobalId(String id) {
		relay.fromGlobalId(id)
	}

	static GraphQLInterfaceType nodeInterface(TypeResolver typeResolver) {
		relay.nodeInterface(typeResolver)
	}

	static GraphQLFieldDefinition nodeField(GraphQLInterfaceType interfaceType, DataFetcher dataFetcher) {
		relay.nodeField(interfaceType, dataFetcher)
	}

	static List<String> eagerFetchStrings(DataFetchingEnvironment env) {
		env.fields.collectMany { queryField ->
			_eagerFetchStrings('', queryField.selectionSet, env)
		}
	}

	private static List<String> _eagerFetchStrings(String path, SelectionSet selectionSet, DataFetchingEnvironment env) {
		selectionSet.selections.collectMany { fragmentOrField ->
			switch (fragmentOrField.class) {

				case InlineFragment:
					return _eagerFetchStrings(path, (fragmentOrField as InlineFragment).selectionSet, env)

				case FragmentSpread:
					return _eagerFetchStrings(path, env.fragmentsByName[(fragmentOrField as FragmentSpread).name].selectionSet, env)

				case Field:
					return _eagerFetchStrings(path, fragmentOrField as Field, env)

				default:
					throw new Exception('Selection is not fragment or field')
			}
		}
	}

	private static List<String> _eagerFetchStrings(String path, Field field, DataFetchingEnvironment env) {
		String fieldPath = path + field.name
		List<String> ret = [ fieldPath ]
		if (field.selectionSet?.selections) {
			ret.addAll _eagerFetchStrings(fieldPath + '.', field.selectionSet, env)
		}
		ret
	}

	public final static String INTROSPECTION_QUERY =
			"""query IntrospectionQuery {
			    __schema {
			      queryType { name }
			      mutationType { name }
			      subscriptionType { name }
			      types {
			        ...FullType
			      }
			      directives {
			        name
			        description
			        args {
			          ...InputValue
			        }
			      }
			    }
			  }
			  fragment FullType on __Type {
			    kind
			    name
			    description
			    fields(includeDeprecated: true) {
			      name
			      description
			      args {
			        ...InputValue
			      }
			      type {
			        ...TypeRef
			      }
			      isDeprecated
			      deprecationReason
			    }
			    inputFields {
			      ...InputValue
			    }
			    interfaces {
			      ...TypeRef
			    }
			    enumValues(includeDeprecated: true) {
			      name
			      description
			      isDeprecated
			      deprecationReason
			    }
			    possibleTypes {
			      ...TypeRef
			    }
			  }
			  fragment InputValue on __InputValue {
			    name
			    description
			    type { ...TypeRef }
			    defaultValue
			  }
			  fragment TypeRef on __Type {
			    kind
			    name
			    ofType {
			      kind
			      name
			      ofType {
			        kind
			        name
			        ofType {
			          kind
			          name
			          ofType {
			            kind
			            name
			            ofType {
			              kind
			              name
			              ofType {
			                kind
			                name
			                ofType {
			                  kind
			                  name
			                }
			              }
			            }
			          }
			        }
			      }
			    }
			  }"""
}

