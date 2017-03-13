var path = require('path');
var babelRelayPlugin = path.join(__dirname, 'src/main/webapp/js/babelRelayPlugin');

module.exports = {
    entry: {
        index: './src/main/webapp/js/index.js'
    },
    output: {
        path: './grails-app/assets/javascripts',
        publicPath: '/assets/',
        filename: 'wp-bundle.js'
    },
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(__dirname, 'src/main/webapp/js'),
				loader: 'babel-loader',
				query: {
					plugins: [babelRelayPlugin, 'transform-class-properties'],
					presets: ['react', 'es2015', 'stage-0']
				}
			}
		]
	}
};