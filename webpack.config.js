let path = require('path');

module.exports = {
    entry: {
        index: './src/main/js/index.js'
    },
    output: {
        path: path.join(__dirname, './grails-app/assets/javascripts'),
        publicPath: '/assets/',
        filename: 'wp-bundle.js'
    },
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				include: path.join(__dirname, 'src/main/js'),
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env', 'react'],
						plugins: [
							['relay', {'compat': true,'schema': './schema.json'}],
							'transform-class-properties'
						]
					}
				},
			}
		]
	}
};