/**
 * Created by mcirillo on 1/24/17.
 */

function resolveMPTT(relayNodes) {
	let stack = relayNodes.slice(0).sort((a,b) => a.leftBound - b.leftBound);

	// create a fake "root" for the tree
	let root = {
		id: false,
		leftBound: 0,
		rightBound: Math.max(...relayNodes.map(n => n.rightBound)) + 1,
	};

	let nodeMap = {};
	root = resolveMPTT_Recurse(root, stack, nodeMap);

	// group by depth and relation
	const levelOne = root.children;
	const levelTwo = levelOne
		.map(node => node.children) // [[nodegroup], [nodegroup]]
		.filter(nodeGroup => nodeGroup.length);
	const levelThree = levelTwo
		.reduce((a, b) => a.concat(b), [])
		.map(node => node.children)
		.filter(nodeGroup => nodeGroup.length);

	// associate each child group with the next/previous for column navigation
	const firstBaseNode = root.children[0];
	const lastBaseNode = root.children[root.children.length - 1];
	firstBaseNode.siblingAbove = lastBaseNode;
	lastBaseNode.siblingBelow = firstBaseNode;

	for (let i = 0; i < levelTwo.length; i++) {
		let nodeGroup = levelTwo[i];
		let lastOfThisGroup = nodeGroup[nodeGroup.length - 1];
		let nextOfNextGroup = levelTwo[(i + 1) % levelTwo.length][0];
		lastOfThisGroup.siblingBelow = nextOfNextGroup;
		nextOfNextGroup.siblingAbove = lastOfThisGroup;
	}

	for (let i = 0; i < levelThree.length; i++) {
		let nodeGroup = levelThree[i];
		let lastOfThisGroup = nodeGroup[nodeGroup.length - 1];
		let nextOfNextGroup = levelThree[(i + 1) % levelThree.length][0];
		lastOfThisGroup.siblingBelow = nextOfNextGroup;
		nextOfNextGroup.siblingAbove = lastOfThisGroup;
	}

	return {
		root,
		nodeMap,
		levelOne,
		levelTwo,
		levelThree
	};
}

function resolveMPTT_Recurse(node, stack, map) {
	const moddedNode = {
		id: node.id,
		leftBound: node.leftBound,
		rightBound: node.rightBound,
		children: []
	};

	map[node.id] = moddedNode;

	if (node.rightBound - node.leftBound != 1) {
		while (stack.length && stack[0].leftBound < node.rightBound) {
			const child = resolveMPTT_Recurse(stack.shift(), stack, map);
			child.parent = moddedNode;
			if (moddedNode.children.length) {
				child.siblingAbove = moddedNode.children[moddedNode.children.length - 1];
				child.siblingAbove.siblingBelow = child;
			}
			moddedNode.children.push(child);
		}
	}
	return moddedNode;
}

function areRelated(mpttNode1, mpttNode2) {

	let mutualParent = mpttNode1;
	while (mutualParent.parent.id) {
		mutualParent = mutualParent.parent;
	}

	return mpttNode2.leftBound > mutualParent.leftBound && mpttNode2.rightBound < mutualParent.rightBound;
}

function pathToNode(root, leftBound, rightBound) {
	return pathToNode_Recurse(root, leftBound, rightBound, []);
}

function pathToNode_Recurse(root, leftBound, rightBound, stack) {

	if (!root)
		return stack;
	else
		stack.push(root);

	const newRoot = root.children.find(function (child) {
		return child.rightBound >= rightBound && child.leftBound <= leftBound;
	});

	return pathToNode_Recurse(newRoot, leftBound, rightBound, stack);
}

function flattenOneLevel(arr) {
	return arr.reduce((a, b) => a.concat(b), []);
}

export { resolveMPTT, areRelated, pathToNode, flattenOneLevel };