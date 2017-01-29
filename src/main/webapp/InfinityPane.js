/**
 * Created by mcirillo on 1/27/17.
 */

import React from 'react';
import bem from './BemTool';

class InfinityPane extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			pos: 0,
		};
	}

	getChildContext() {
		return { scrollToHere: this.context_scrollToHere };
	}

	_handleWheel = (event) => {
		let proposedPos = this.state.pos + event.deltaY * 2;

		if (proposedPos > this.pane.clientHeight / 2)
			proposedPos = this.pane.clientHeight / 2;
		else if (proposedPos < -this.mover.clientHeight + this.pane.clientHeight / 2)
			proposedPos = -this.mover.clientHeight + this.pane.clientHeight / 2;

		this.setState({ pos: proposedPos });
	};

	context_scrollToHere = (childMiddleY) => {
		const location = this.pane.clientHeight / 2 - childMiddleY;
		this.setState({ pos: location });
	};

	ref_pane = (ref) => {
		this.pane = ref;
	};

	ref_mover = (ref) => {
		this.mover = ref;
	};

	render() {
		return (
			<div ref={this.ref_pane} className={bem('infinity-pane')} onWheel={this._handleWheel}>
				<div
					ref={this.ref_mover}
					style={{ transform: `translateY(${this.state.pos}px)` }}
					className={bem('infinity-pane', 'mover')}
				>
					{this.props.children}
				</div>
			</div>
		);
	}

}

InfinityPane.childContextTypes = {
	scrollToHere: React.PropTypes.func
};

export default InfinityPane;