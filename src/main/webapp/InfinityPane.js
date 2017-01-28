/**
 * Created by mcirillo on 1/27/17.
 */

import React from 'react';
import bem from './BemTool';

class InfinityPane extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			pos: 0,
		};
	}

	componentDidUpdate() {
		console.log(this.state.pos);
	}

	_handleWheel = (event) => {
		this.setState({ pos: this.state.pos + event.deltaY * 2 });
	};

	render() {
		return (
			<div className={bem('infinity-pane')} onWheel={this._handleWheel}>
				<div
					style={{ transform: `translateY(${this.state.pos}px)` }}
				    className={bem('infinity-pane', 'mover')}
				>
					{this.props.children}
				</div>
			</div>
		);
	}

}

export default InfinityPane;