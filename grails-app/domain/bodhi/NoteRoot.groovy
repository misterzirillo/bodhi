package bodhi

import io.cirill.relay.annotation.RelayField
import io.cirill.relay.annotation.RelayType

/**
 * bodhi
 * @author mcirillo
 */
@RelayType
class NoteRoot {

	static belongsTo = [ owner: User ]
	static hasMany = [ nodes: NoteNode ]

	static constraints = {
		description nullable: true
		lastEditedNote nullable: true
	}

	@RelayField
	Set<NoteNode> nodes = []

	@RelayField
	String name

	@RelayField
	String description

	@RelayField
	NoteNode lastEditedNote

//	@RelayProxyField
//	static childrenProxy = {
//		GQLFieldSpec.field {
//			name 'children'
//			description 'All children on this node'
//			type {
//				ref 'NoteNode'
//			}
//			dataFetcher { env ->
//				def source = env.source as NoteRoot
//				def query = NoteNode.where {
//					leftBound > source.leftBound && rightBound < source.rightBound
//				}
//				def eagerLoad = RelayHelpers.eagerFetchStrings(env).collect {["$it": 'eager' ]}
//				def nodes = query.list fetch: eagerLoad, sort: 'leftBound'
//				resolveMPTT(source, nodes)
//				source.children
//			}
//		}
//	}


//	static void resolveMPTT(NoteRoot root, List<NoteNode> nodes) {
//		def stack = nodes.sort({ it.leftBound }) as Stack<NestedSetModel>
//		root.children = []
//		resolveMPTT_Recurse(root, stack)
//	}
//
//	private static NestedSetModel resolveMPTT_Recurse(NestedSetModel node, Stack<NestedSetModel> stack) {
//		if (node.rightBound - node.leftBound != 1) {
//			while (!stack.empty() && stack.peek().leftBound < node.rightBound)
//				node.children << resolveMPTT_Recurse(stack.pop(), stack)
//		}
//		node
//	}
}
