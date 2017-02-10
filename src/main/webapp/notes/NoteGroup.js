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

	static _groupIsRelated = (nodeGroup, selectedNode) => {
		let groupIsRelated = false;
		if (nodeGroup.parentNode) {
			if (nodeGroup.parentNode === selectedNode) {
				groupIsRelated = true;
			} else if (nodeGroup.parentNode.parentNode === selectedNode) {
				groupIsRelated = true;
			}
		}
		return groupIsRelated;
	};

	constructor(props) {
		super(props);
		this.lastSelectedNote = null;
		this.scrollAfterUpdate = NoteGroup._groupIsRelated(props.nodeGroup, props.selectedNode);
	}

	componentWillReceiveProps(nextProps) {
		const { selectedNode: nextSelected, nodeGroup: nextGroup } = nextProps;
		const { selectedNode: currSelected, nodeGroup: currGroup } = this.props;

		this.scrollAfterUpdate = !NoteGroup._groupIsRelated(currGroup, currSelected) && NoteGroup._groupIsRelated(nextGroup, nextSelected);
	}

	componentDidUpdate() {
		if (this.scrollAfterUpdate) {
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
		const { nodeGroup, selectedNode, selectNode, registerSaveFn } = this.props;
		const groupIsRelated = NoteGroup._groupIsRelated(nodeGroup, selectedNode);

		const notePanes = nodeGroup.nodes.map((node, i) => {

			let nodeIsRelated = false;
			if (!groupIsRelated) {
				if (selectedNode.parentNode) {
					if (selectedNode.parentNode === node) {
						nodeIsRelated = true;
					} else if (selectedNode.parentNode.parentNode === node) {
						nodeIsRelated = true;
					}
				}
			} else {
				nodeIsRelated = true;
			}

			return <NotePane
				key={i}
				node={node.relayNode}
				selected={node === selectedNode}
				related={nodeIsRelated}
				selectNode={selectNode}
				registerSaveFn={registerSaveFn}
			/>
		});

		return (
			<div className={bemTool('note-columns', 'note-group')} ref={this._ref_el}>
				{notePanes}
			</div>
		);
	}
}

export default NoteGroup;