/**
 * Created by mcirillo on 1/19/17.
 */
import Relay from 'react-relay/classic';

export default class Route extends Relay.Route {
	static path = '/';
	static queries = {
		user: (component) => Relay.QL`query { currentUser { ${component.getFragment('user')} }}`
	};
	static routeName = 'Route';
}
