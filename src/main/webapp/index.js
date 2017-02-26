import ReactDOM from 'react-dom';
import React from 'react';
import Relay from 'react-relay';
import AppRoot from './AppRoot';
import Route from './route';
import MainLoadingSpinner from './other/MainLoadingSpinner2';

window.startApp = () => {

	Relay.injectNetworkLayer(
		new Relay.DefaultNetworkLayer('/graphql', {
			credentials: 'same-origin',
		})
	);

	ReactDOM.render(
	<Relay.Renderer
		Container={AppRoot}
		queryConfig={new Route()}
		environment={Relay.Store}
		render={({done, error, props, retry, stale}) => {
			if (error) {
				return <div>Error</div>;
			} else if (props) {
				return <AppRoot { ...props } />;
				//return <MainLoadingSpinner/>;
			} else {
				return <MainLoadingSpinner/>;
			}
		}}
	/>,
		document.getElementById('app-root')
	);
};

if (window.domready) {
	window.startApp();
}
