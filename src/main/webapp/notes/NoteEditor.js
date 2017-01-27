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
			<textarea
				style={this.props.style}
				className={this.props.className}
				value={this.state.value}
				onChange={this.handleChange}
				ref={ref => this.focusMe = ref} />
		);
	}
}