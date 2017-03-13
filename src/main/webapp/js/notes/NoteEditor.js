import React from 'react';

export default class Editor extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			value: props.content
		};
	}

	componentDidMount() {
		this.focusMe.focus();
	}

	handleChange = (event) => {
		this.setState({ value: event.target.value });
		if (!this.isDirty && this.props.content != this.state.value) {
			this.props.notifyDirty();
		}
	};

	blur = () => {
		this.focusMe.blur();
	};

	focus = () => {
		this.focusMe.focus();
	};

	getValue = () => {
		return this.state.value;
	};

	render() {
		return (
			<div className={this.props.className}>
				<textarea onChange={this.handleChange} ref={ref => this.focusMe = ref} value={this.state.value}/>
			</div>
		);
	}
}