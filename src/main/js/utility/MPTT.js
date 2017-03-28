/**
 * Created by mcirillo on 1/24/17.
 */

class MPTTNode {

	constructor(id, leftBound, rightBound, level, containingNodeGroup) {
		this.id = id;
		this.leftBound = leftBound;
		this.rightBound = rightBound;
		this.level = level;
		this.containingNodeGroup = containingNodeGroup;
		// this.parentNode = parentNode; // the containingNodeGroup should be used for this
		this.childNodeGroup = null;
		this.siblingAbove = null;
		this.siblingBelow = null;
	}

	isParentOf = (node) => {
		return this.leftBound < node.leftBound && this.rightBound > node.rightBound;
	};

	getAbove = () => {
		let above = this.siblingAbove;
		if (above === null) {
			const nextGroup = this.containingNodeGroup.groupAbove.nodes;
			above = nextGroup[nextGroup.length - 1];
		}
		return above;
	};

	getBelow = () => {
		let below = this.siblingBelow;
		if (below === null) {
			const nextGroup = this.containingNodeGroup.groupBelow.nodes;
			below = nextGroup[0];
		}
		return below;
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
		return this.nodes.some(n => n.id === id);
	};

	isChildOf = (node) => {
		let nodeGroup = this;
		while (nodeGroup.parentNode) {
			if (nodeGroup.parentNode === node) return true;
			else nodeGroup = nodeGroup.parentNode.containingNodeGroup;
		}
	}
}

class MPTT {

	constructor(relayNodes) {

		let stack = relayNodes.slice(0).sort((a,b) => a.leftBound - b.leftBound);
		this._nodeMap = {};
		this._nodeGroups = [];

		if (stack.length > 0) {
			// bootstrap mptt with a fake root node
			const dummyNodeId = 'DUMMY_NODE';
			const dummyRoot = new MPTTNode(
				dummyNodeId,
				Math.min(...stack.map(node => node.leftBound)) - 1,
				Math.max(...stack.map(node => node.rightBound)) + 1,
				0
			);
			this._resolveMPTT(dummyRoot, stack, 0);

			// clean up after fake node
			delete this._nodeMap[dummyNodeId];
			this._nodeGroups[0].parentNode = null;

			// associate each node group with the next/previous
			const minLevel = Math.min(...this._nodeGroups.map(ng => ng.level));
			const maxLevel = Math.max(...this._nodeGroups.map(ng => ng.level));
			for (let level = minLevel; level <= maxLevel; level++) {
				const nodeGroups = this.nodeGroupsByLevel(level);
				for (let i = 0; i < nodeGroups.length; i++) {
					let nodeGroup = nodeGroups[i];
					let nextGroup = nodeGroups[(i + 1) % nodeGroups.length];
					nodeGroup.groupBelow = nextGroup;
					nextGroup.groupAbove = nodeGroup;
				}
			}
		}
	}

	getNodeById = (id) => {
		return this._nodeMap[id];
	};

	nodeGroupsByLevel = (level) => {
		return this._nodeGroups.filter(group => group.level === level);
	};

	 _resolveMPTT = (relayNode, stack, level, nodeGroup) => {
		const currentRoot = new MPTTNode(
			relayNode.id,
			relayNode.leftBound,
			relayNode.rightBound,
			level,
			nodeGroup
		);

		this._nodeMap[relayNode.id] = currentRoot;

		if (relayNode.rightBound - relayNode.leftBound !== 1) {

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