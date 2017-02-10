/**
 * Created by mcirillo on 1/24/17.
 */

class MPTTNode {

	constructor(id, leftBound, rightBound, level, containingNodeGroup, parentNode) {
		this.id = id;
		this.leftBound = leftBound;
		this.rightBound = rightBound;
		this.level = level;
		this.containingNodeGroup = containingNodeGroup;
		this.parentNode = parentNode;
		this.childNodeGroup = null;
		this.siblingAbove = null;
		this.siblingBelow = null;
	}

	isParentOf = (node) => {
		return this.leftBound < node.leftBound && this.rightBound > node.rightBound;
	};

}

class MPTTNodeGroup {

	constructor(parent, level) {
		this.level = level;
		this.parentNode = parent;
		this.nodes = [];
		this.groupAbove = null;
		this.groupBelow = null;
	}

	containsNodeWithId = (id) => {
		return this.nodes.some(n => n.id == id);
	};

	isChildOf = (node) => {
		switch (this.level - node.level) {
			case 1:
				return this.parentNode === node;
			case 2:
				return this.parentNode.parentNode === node;
			default:
				return false;
		}
	}

}

class MPTT {

	constructor(relayNodes) {

		let stack = relayNodes.slice(0).sort((a,b) => a.leftBound - b.leftBound);
		this._nodeMap = {};
		this._nodeGroups = [];

		while (stack.length) {
			const levelOneNodeGroup = new MPTTNodeGroup(null, 1);
			this._nodeGroups.push(levelOneNodeGroup);
			const levelOneNode = this._resolveMPTT(stack.shift(), stack, 1, levelOneNodeGroup);
			levelOneNodeGroup.nodes.push(levelOneNode);
		}

		// associate each node group with the next/previous for column navigation
		const levelOne = this.nodeGroupsByLevel(1);
		for (let i = 0; i < levelOne.length; i++) {
			let nodeGroup = levelOne[i];
			let nextGroup = levelOne[(i + 1) % levelOne.length];
			nodeGroup.groupBelow = nextGroup;
			nextGroup.groupAbove = nodeGroup;
		}

		const levelTwo = this.nodeGroupsByLevel(2);
		for (let i = 0; i < levelTwo.length; i++) {
			let nodeGroup = levelTwo[i];
			let nextGroup = levelTwo[(i + 1) % levelTwo.length];
			nodeGroup.groupBelow = nextGroup;
			nextGroup.groupAbove = nodeGroup;
		}

		const levelThree = this.nodeGroupsByLevel(3);
		for (let i = 0; i < levelThree.length; i++) {
			let nodeGroup = levelThree[i];
			let nextGroup = levelThree[(i + 1) % levelThree.length];
			nodeGroup.groupBelow = nextGroup;
			nextGroup.groupAbove = nodeGroup;
		}
	}

	getNodeById = (id) => {
		return this._nodeMap[id];
	};

	nodeGroupsByLevel = (level) => {
		return this._nodeGroups.filter(group => group.level == level);
	};

	 _resolveMPTT = (relayNode, stack, level, nodeGroup, parentNode) => {
		const currentRoot = new MPTTNode(
			relayNode.id,
			relayNode.leftBound,
			relayNode.rightBound,
			level,
			nodeGroup,
			parentNode
		);

		this._nodeMap[relayNode.id] = currentRoot;

		if (relayNode.rightBound - relayNode.leftBound != 1) {

			// if this node has children then set up a node group
			const newNodeGroup = new MPTTNodeGroup(currentRoot, level + 1);
			currentRoot.childNodeGroup = newNodeGroup;
			this._nodeGroups.push(newNodeGroup);

			// since the stack is in order we can pop out all the children like so
			while (stack.length && stack[0].leftBound < relayNode.rightBound) {
				const child = this._resolveMPTT(stack.shift(), stack, level + 1, newNodeGroup, currentRoot);

				// link the nodes together if they aren't first node
				// first/last nodes lack siblingAbove/siblingBelow, respectively
				if (newNodeGroup.nodes.length) {
					child.siblingAbove = newNodeGroup.nodes[newNodeGroup.nodes.length - 1];
					child.siblingAbove.siblingBelow = child;
				}
				newNodeGroup.nodes.push(child);
			}
		}

		return currentRoot;
	}
}

export default MPTT;