package bodhi

import graphql.Scalars
import io.cirill.relay.annotation.RelayEnum
import io.cirill.relay.annotation.RelayField
import io.cirill.relay.annotation.RelayProxyField
import io.cirill.relay.annotation.RelayType
import io.cirill.relay.dsl.GQLFieldSpec

/**
 * bodhi
 * @author mcirillo
 */
@RelayType
class NoteRoot implements SwitchRootMutation, AddNoteMutation, DeleteNoteMutation, MoveNoteMutation {

	static belongsTo = [ owner: User ]
	static hasMany = [ nodes: NoteNode ]

	static constraints = {
		description nullable: true
		lastEditedNode nullable: true
	}

	Date dateCreated, lastUpdated

	@RelayProxyField
	static lastUpdatedProxy = {
		GQLFieldSpec.field {
			name 'lastUpdated'
			type Scalars.GraphQLLong
			dataFetcher { env ->
				(env.source as NoteRoot).lastUpdated.time
			}
		}
	}

	@RelayField
	Set<NoteNode> nodes = []

	@RelayField
	String name

	@RelayField
	String description

	@RelayField
	NoteNode lastEditedNode

	@RelayEnum
	public enum MoveMode {
		Before,
		After
	}

	//<editor-fold desc="Operations">
	void deleteNoteFromHere(long id) {
		def deletedNode = nodes.find { it.id == id }

		if (!deletedNode) {
			throw new Exception('This root does not contain the specified node')
		}

		def targetLeftBound = deletedNode.leftBound
		def toEdit = NoteNode.where {
			root == this
			rightBound >= targetLeftBound
		}.list(fetch: ['rightBound', 'leftBound'])

		def deletedNodes = toEdit.findAll { it.leftBound >= targetLeftBound && it.rightBound <= deletedNode.rightBound }
		toEdit.removeAll(deletedNodes)

		int removedRange = deletedNode.rightBound - deletedNode.leftBound + 1
		toEdit.each { node ->
			if (node.leftBound >= targetLeftBound)
				node.leftBound -= removedRange
			if (node.rightBound >= targetLeftBound)
				node.rightBound -= removedRange
		}

		deletedNodes.each { removeFromNodes(it) }
		deletedNodes*.delete()

		def nodeToSelect = toEdit.findAll { it.leftBound < deletedNode.leftBound }.max { it.leftBound }
		if (!nodeToSelect) {
			nodeToSelect = nodes[0]
		}

		lastEditedNode = nodeToSelect
		lastUpdated = new Date()
		save()
	}

	void addNoteHere(int leftBound) {
		nodes.each { node ->
			if (node.leftBound >= leftBound) {
				node.leftBound += 2
			}
			if (node.rightBound >= leftBound) {
				node.rightBound += 2
			}
		}

		def newNode = new NoteNode(content: '', leftBound: leftBound, rightBound: leftBound + 1, root: this).save()
		lastEditedNode = newNode
		addToNodes(newNode)
		lastUpdated = new Date()
		save()
	}

	void moveNote(long movingId, long targetId, MoveMode mode) {
		def movingNode = nodes.find { it.id == movingId }
		def targetNode = nodes.find { it.id == targetId }

		if (movingNode && targetNode) {
			def movingBoundaries = movingNode.leftBound..movingNode.rightBound
			def displacedBoundaries
			int newLB, newRB, displacement = movingBoundaries.size()

			boolean shiftLeft
			if (targetNode.leftBound < movingNode.leftBound && targetNode.rightBound > movingNode.rightBound)
				// is child, so before/after will determine which way the displacement happens
				// moving a child element after it's parent means some parent bounds will shift left
				shiftLeft = mode == MoveMode.After
			else if (targetNode.leftBound >= movingNode.leftBound && targetNode.rightBound <= movingNode.rightBound)
				// node is trying to move inside itself this is not allowed
				throw new Exception('Illegal move parameters')
			else
				shiftLeft = targetNode.leftBound > movingNode.leftBound

			if (shiftLeft) {

				if (mode == MoveMode.Before)
					newRB = targetNode.leftBound - 1
				else
					newRB = targetNode.rightBound

				displacedBoundaries = newRB..<movingNode.rightBound
				displacement = -displacement

			} else {

				if (mode == MoveMode.Before)
					newLB = targetNode.leftBound
				else
					newLB = targetNode.rightBound + 1

				displacedBoundaries = newLB..<movingNode.leftBound

			}

			def movingNodes = nodes.findAll { it.leftBound in movingBoundaries }
			def distance = shiftLeft ? displacedBoundaries.size() : -displacedBoundaries.size()

			shiftBounds displacedBoundaries, displacement
			movingNodes.each {
				it.leftBound += distance
				it.rightBound += distance
			}

			lastEditedNode = movingNode
			lastUpdated = new Date()
			save()
		}
	}

	private void shiftBounds(Range range, int increment) {
		def toEdit = nodes.findAll { node -> node.rightBound in range || node.leftBound in range }
		toEdit.each { node ->
			if (node.leftBound in range) {
				node.leftBound += increment
			}
			if (node.rightBound in range) {
				node.rightBound += increment
			}
		}
	}
	//</editor-fold>
}
