module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	output: {
		path: __dirname + '/lib',
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader'
			}
		]
	}
};
