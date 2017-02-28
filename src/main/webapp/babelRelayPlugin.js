var babelRelayPlugin = require('babel-relay-plugin');
var request = require('sync-request');
var fs = require('fs');

var schema;

// since I am using http2 I need TLS and created a self signed cert.
// so we need to ignore untrusted ssl
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

try {
	// in dev the local server is probably running, so build the schema using
	// introspection query and save it to the filesystem
	var response = request('GET', 'http://localhost:8080/graphql/introspect');
	schema = JSON.parse(response.body.toString('utf-8'));
	fs.writeFileSync("./schema.json", response.body.toString('utf-8'));
} catch (e) {
	console.warn('Server unavailable for introspection, falling back to schema.json');
	schema = JSON.parse(fs.readFileSync('./schema.json'));
}


module.exports = babelRelayPlugin(schema.data);
