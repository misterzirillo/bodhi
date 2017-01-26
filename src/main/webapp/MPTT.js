/**
 * Created by mcirillo on 1/24/17.
 */

function resolveMPTT(root, nodes) {
	let stack = nodes.sort((a,b) => a.leftBound - b.leftBound);
	root.children = [];
	return resolveMPTT_Recurse(root, stack);
}

function resolveMPTT_Recurse(node, stack) {
	if (node.rightBound - node.leftBound != 1) {
		node.children = [];
		while (stack.length && stack[0].leftBound < node.rightBound) {
			node.children.push(resolveMPTT_Recurse(stack.shift(), stack));
		}
	}
	return node;
}

function levelOneRelation(node, lastSelectedNode) {
	return node.leftBound < lastSelectedNode.leftBound && node.rightBound > lastSelectedNode.rightBound;
}

function levelTwoRelation(node, lastSelectedNode) {
	// a child node is selected
	return (node.leftBound < lastSelectedNode.leftBound && node.rightBound > lastSelectedNode.rightBound)
		||
		// some parent node is selected
		(node.leftBound > lastSelectedNode.leftBound && node.rightBound < lastSelectedNode.rightBound);
}

function levelThreeRelation(node, lastSelectedNode) {
	return node.leftBound > lastSelectedNode.leftBound && node.rightBound < lastSelectedNode.rightBound;
}

export { resolveMPTT, levelOneRelation, levelTwoRelation, levelThreeRelation };