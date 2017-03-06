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

		const groupIsRelated = nodeGroup.isChildOf(selectedNode);

		const notePanes = nodeGroup.nodes.map(node => {

			const nodeIsRelated = groupIsRelated || node.isParentOf(selectedNode);
			const nodeIsSelected = !nodeIsRelated && node === selectedNode;
			const nodeShouldScrollToSelf = groupIsRelated ? false : nodeIsRelated || nodeIsSelected;

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
					moveMode={nodeIsSelected ? this.props.moveMode : null}
				    isMoving={movingNodeId == node.id}
				/>
			);
		});

		return (
			<div className={bemTool('note-columns', 'note-group')} ref={this._ref_el}>
				{notePanes}
			</div>
		);
	}
}

export default NoteGroup;