module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	resolve: {
		extensions: ['.ts', '.js']
	},
	output: {
		path: __dirname + '/lib',
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: 'awesome-typescript-loader'
			}
		]
	}
};
