/**
 * Created by mcirillo on 1/27/17.
 */

import React from 'react';
import { GenericScrollBox, FastTrack } from 'react-scroll-box';
import bem from '../BemTool';

class NoteColumn extends React.PureComponent {

	static childContextTypes = {
		scrollToHere: React.PropTypes.func
	};

	deferredScroll = false;

	componentDidMount() {
		if (this.deferredScroll) {
			this.context_scrollToHere(this.deferredScroll);
		}
	}

	getChildContext() {
		return { scrollToHere: this.context_scrollToHere };
	}

	context_scrollToHere = (childMiddleY) => {
		if (this.scrollBox) {
			const location = childMiddleY - this.scrollBox.el.clientHeight / 2;
			this.scrollBox.scrollTo(null, location, 150);
		} else {
			this.deferredScroll = childMiddleY;
		}
	};

	ref_scrollBox = (ref) => {
		this.scrollBox = ref;
	};

	render() {
		const { children, level } = this.props;

		return (
			<GenericScrollBox
				style={{height: '100%'}}
				scrollableX={false}
				hideScrollBarX={true}
				outset={false}
				captureKeyboard={false}
				fastTrack={FastTrack.GOTO}
				wheelStepY={175}
				className={[
					bem('scroll-box', null, ['wrapped', 'has-axis-y']),
					bem('note-columns', 'column', `level-${level}`)
				]}
		    ref={this.ref_scrollBox}
			>
				<div
					style={{boxSizing: 'border-box'}}
					className="scroll-box__viewport"
				>
					<div className={bem('note-columns', 'spacer')}/>
					{children}
					<div className={bem('note-columns', 'spacer')}/>
				</div>
			</GenericScrollBox>
		);
	}

}

export default NoteColumn;
