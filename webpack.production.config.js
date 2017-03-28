var path = require('path');
var babelRelayPlugin = path.join(__dirname, 'src/main/js/utility/babelRelayPlugin');
var webpack = require('webpack');

module.exports = {
	devtool: 'cheap-module-source-map',

	entry: {
		index: ['./src/main/js/index.js']
	},
	output: {
		path: './grails-app/assets/javascripts',
		publicPath: '/assets/',
		filename: 'wp-bundle-prod.js'
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(__dirname, 'src/main/js'),
				loader: 'babel-loader',
				query: {
					plugins: [
						babelRelayPlugin,
						'transform-class-properties'
					],
					presets: ['react', 'es2015', 'stage-0']
				}
			}
		]
	}
};
