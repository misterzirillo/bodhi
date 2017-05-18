/**
 * Created by mcirillo on 2/19/17.
 */

import React from 'react';
import Relay from 'react-relay';
import bem from '../utility/BemTool';

import NavModal, { Position } from '../composable/NavModal';
import GlobalModal from '../composable/GlobalModal';
import SwitchRootMutation from '../mutation/SwitchRootMutation';
import AddRootMutation from '../mutation/AddRootMutation';

class NoteRootPicker extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selecting: false,
			creatingNewRoot: !props.user.lastSelectedRoot,
			nameValue: '',
			descValue: '',
			rootCreationError: ''
		}
	}

	componentDidUpdate() {
		if (this.state.creatingNewRoot && this.doFocus) {
			this.nameInput.focus();
			this.doFocus = false;
		}
	}

	event_onClick = () => {
		this.setState({ selecting: !this.state.selecting });
	};

	event_onClickRoot = (id) => {
		const mutation = new SwitchRootMutation({ newRootId: id, currentUserId: this.props.user.id  });
		this.props.relay.commitUpdate(mutation);
	};

	event_onClickCreate = () => {
		this.setState({ creatingNewRoot: true });
		this.doFocus = true;
	};

	event_onClickCreateClose = () => {
		this.setState({ creatingNewRoot: false });
	};

	event_onClickSubmit = () => {
		const {	nameValue: newRootName, descValue: newRootDescription } = this.state;

		if (newRootName) {
			const mutation = new AddRootMutation({newRootName, newRootDescription, user: this.props.user});
			this.props.relay.commitUpdate(mutation);
			this.setState({
				nameValue: '',
				descValue: '',
				creatingNewRoot: false
			});
		} else {
			this.setState({
				rootCreationError: 'Please enter a name for the root.'
			});
		}
	};

	event_onNameChange = (e) => {
		this.setState({ nameValue: e.target.value, rootCreationError: '' });
	};

	event_onDescChange = (e) => {
		this.setState({ descValue: e.target.value });
	};

	ref_nameInput = (ref) => {
		this.nameInput = ref;
	};

	ref_submit = (ref) => {
		this.submit = ref;
	};

	render() {

		const { lastSelectedRoot, rootNodes } = this.props.user;
		const { selecting, creatingNewRoot, nameValue, descValue, rootCreationError } = this.state;

		return (
			<div className={bem('root-picker')}>

				<span onClick={this.event_onClick} className={bem('nav-bar', 'modal-toggle', selecting && 'toggled')}>

					<i className="fa fa-sitemap-h"/>

					<span className={bem('root-picker', 'current-root')}>
						{lastSelectedRoot ? lastSelectedRoot.name : '(None)'}
					</span>


					<NavModal visible={selecting} position={Position.LEFT}>
						<div className={bem('root-picker', 'modal')}>
							{rootNodes.map(node => (
								<div
									className={bem('root-picker', 'root-selection')}
									key={node.id}
									onClick={() => this.event_onClickRoot(node.id)}
								>
									<span className="name">{node.name}</span>
									<span className={bem('root-picker', 'root-selection-last-update')}>
										last updated {new Date(node.lastUpdated).toLocaleString()}
									</span>
								</div>
							))}

							<hr/>

							<div onClick={this.event_onClickCreate} className={bem('root-picker', 'create-new')}>
								<i className="fa fa-plus-square-o" />
								<span>Create</span>
							</div>

						</div>
					</NavModal>
				</span>

				<span className={bem('root-picker', 'current-description')}>
					{lastSelectedRoot ? lastSelectedRoot.description : ''}
				</span>

				<GlobalModal visible={creatingNewRoot} onBackgroundClick={this.event_onClickCreateClose}>
					<div className={bem('root-picker-modal', 'header')}>
						<b>Create a Root</b>
						<i onClick={this.event_onClickCreateClose} className={"fa fa-close " + bem('root-picker-modal', 'close')}/>
					</div>

					<input
						type="text"
						required
						ref={this.ref_nameInput}
						onChange={this.event_onNameChange}
						value={nameValue}
						tabIndex="1"
						placeholder="Name"
						className={bem('root-picker-modal', 'input')}
					/>
					<input
						type="text"
						onChange={this.event_onDescChange}
						value={descValue}
						tabIndex="2"
						placeholder="Description (Optional)"
						className={bem('root-picker-modal', 'input')}
					/>

					<div onClick={this.event_onClickSubmit} ref={this.ref_submit} className={bem('root-picker-modal', 'submit')}>
						Submit
					</div>

					<div className={bem('root-picker-modal', 'error')}>{rootCreationError}</div>
				</GlobalModal>

			</div>
		);
	}

}

export default Relay.createContainer(NoteRootPicker, {

	fragments: {
		user: () => Relay.QL`
			fragment on User {
			
				id,
				
				${AddRootMutation.getFragment('user')}
			
				lastSelectedRoot {
					name,
					description
				},
				
				rootNodes {
					id,
					name,
					lastUpdated
				}
			}
		`
	}

});