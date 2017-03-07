/**
 * Created by mcirillo on 1/22/17.
 */

import React from 'react';
import bemTool from '../BemTool';
import NotePane from './NotePane';

class NoteGroup extends React.PureComponent {

	static contextTypes = {
		scrollToHere: React.PropTypes.func
	};

	constructor(props) {
		super(props);
		this.scrollAfterUpdate = props.nodeGroup.isChildOf(props.selectedNode);
	}

	componentWillReceiveProps(nextProps) {
		const { selectedNode: nextSelected, nodeGroup: nextGroup } = nextProps;
		const { selectedNode: currSelected, nodeGroup: currGroup } = this.props;

		this.scrollAfterUpdate = !currGroup.isChildOf(currSelected) && nextGroup.isChildOf(nextSelected);
	}

	componentDidUpdate() {
		if (this.scrollAfterUpdate) {
			this.scrollAfterUpdate = false;
			this._scrollToMe();
		}
	}

	componentDidMount() {
		if (this.scrollAfterUpdate) {
			this._scrollToMe();
		}
	}

	//<editor-fold desc="private">
	_scrollToMe = () => {
		const here = this.el.offsetTop + this.el.offsetHeight / 2;
		this.context.scrollToHere(here);
	};

	_ref_el = (ref) => {
		this.el = ref;
	};
	//</editor-fold>

	render() {
		const {
			nodeGroup,
			selectedNode,
			selectNode,
			registerSaveFn,
			relayNodeMap,
			refForNoteNode,
			movingNodeId
		} = this.props;

		const groupIsChild = nodeGroup.isChildOf(selectedNode);
		let groupIsRelated = groupIsChild;

		const notePanes = nodeGroup.nodes.map(node => {

			const nodeIsRelated = groupIsChild || node.isParentOf(selectedNode);
			const nodeIsSelected = !nodeIsRelated && node === selectedNode;
			const nodeShouldScrollToSelf = groupIsChild ? false : nodeIsRelated || nodeIsSelected;
			const isMoving = movingNodeId == node.id;
			const shouldDisplayMoveMode = nodeIsSelected ? this.props.moveMode : null;

			groupIsRelated = groupIsRelated || nodeIsRelated || nodeIsSelected;

			return (
				<NotePane
					key={node.id}
					node={relayNodeMap[node.id]}
					selected={nodeIsSelected}
					related={nodeIsRelated}
					shouldScroll={nodeShouldScrollToSelf}
					selectNode={selectNode}
					registerSaveFn={registerSaveFn}
				    refWhenSelected={refForNoteNode}
					moveMode={shouldDisplayMoveMode}
				    isMoving={isMoving}
				/>
			);
		});

		return (
			<div className={bemTool('note-columns', 'note-group', groupIsRelated && 'related')} ref={this._ref_el}>
				{notePanes}
			</div>
		);
	}
}

export default NoteGroup;