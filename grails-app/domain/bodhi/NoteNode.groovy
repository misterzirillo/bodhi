package bodhi

import graphql.Scalars
import io.cirill.relay.RelayHelpers
import io.cirill.relay.annotation.RelayField
import io.cirill.relay.annotation.RelayMutation
import io.cirill.relay.annotation.RelayProxyField
import io.cirill.relay.annotation.RelayType
import io.cirill.relay.dsl.GQLFieldSpec
import io.cirill.relay.dsl.GQLMutationSpec

@RelayType
class NoteNode {

	static constraints = {
		content nullable: true
	}

    static mapping = {
	    content sqlType: 'text' // text maps to clob sql type
    }

	static belongsTo = [ root: NoteRoot ]

	String content

	@RelayField
	int leftBound

	@RelayField
	int rightBound

	@RelayProxyField
	static contentProxy = {
		GQLFieldSpec.field {
			name 'content'
			type Scalars.GraphQLString
			argument {
				name 'preview'
				type Scalars.GraphQLBoolean
			}
			dataFetcher { env ->
				def doPreview = env.arguments.preview ?: false
				def source = env.source as NoteNode
				if (doPreview) {
					source.content?.readLines()?.take(10)?.join(System.lineSeparator()) ?: ''
				} else {
					source.content ?: ''
				}
			}
		}
	}

	@RelayMutation
	static noteMutation = {
		GQLMutationSpec.field {
			name 'patchContent'

			inputType {
				name 'PatchContentInput'
				field {
					name 'nodeId'
					type {
						nonNull Scalars.GraphQLID
					}
				}
				field {
					name 'patch'
					type {
						nonNull Scalars.GraphQLString
					}
				}
			}

			type {
				name 'PatchContentPayload'
				field {
					name 'updatedNode'
					type {
						ref 'NoteNode'
					}
				}
				field {
					name 'clientMutationId'
					type {
						nonNull Scalars.GraphQLString
					}
				}
			}

			dataFetcher { env ->
				long nodeId = RelayHelpers.fromGlobalId(env.arguments.input.nodeId as String).id as long
				NoteNode node = NoteNode.get(nodeId)
				node.content = env.arguments.input.patch
				node.root.lastEditedNode = node
				node.save()

				return [
				        clientMutationId: env.arguments.input.clientMutationId,
						updatedNode: node
				]
			}
		}
	}
}
