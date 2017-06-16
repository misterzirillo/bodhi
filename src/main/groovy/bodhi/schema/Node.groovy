package bodhi.schema

import bodhi.GraphQLHelpers
import gql.DSL
import graphql.schema.GraphQLFieldDefinition
import graphql.schema.GraphQLNonNull
import graphql.schema.GraphQLObjectType

/**
 * bodhi
 * @author mcirillo
 */
class Node {

	final static GraphQLObjectType node = DSL.type('NoteNode') {

		field 'leftBound', GraphQLInt
		field 'rightBound', GraphQLInt

		field 'lastUpdated', {
			type GraphQLLong
			fetcher { env ->
				(env.source as bodhi.Node).lastUpdated.time
			}
		}

		field 'content', {
			type GraphQLString
			fetcher { env ->
				def doPreview = env.arguments.preview ?: false
				def source = env.source as bodhi.Node
				if (doPreview) {
					source.content?.readLines()?.take(10)?.join(System.lineSeparator()) ?: ''
				} else {
					source.content ?: ''
				}
			}
		}

		addField Schema.idField
		addInterface Schema.nodeInterface
	}

	final static GraphQLFieldDefinition textUpdate = DSL.field('textUpdate') {

		argument 'input', DSL.input('TextUpdateInput') {
			field 'nodeId', GraphQLID
			field 'patch', new GraphQLNonNull(GraphQLString)
		}

		type DSL.type('TextUpdatePayload') {
			field 'updatedNode', node
			field 'clientMutationId', new GraphQLNonNull(GraphQLString)
		}

		fetcher { env ->
			long nodeId = GraphQLHelpers.fromGlobalId(env.arguments.input.nodeId as String).id as long
			bodhi.Node node = bodhi.Node.get(nodeId)
			node.content = env.arguments.input.patch
			node.root.lastEditedNode = node
			node.root.lastUpdated = new Date()
			node.save()

			return [
					clientMutationId: env.arguments.input.clientMutationId,
					updatedNode: node
			]
		}
	}
}
