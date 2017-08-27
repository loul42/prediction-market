var glob = require('glob');
var path = require('path');

module.exports = {
	entry: {'app' : glob.sync("./app/*.js"),
			'questions' : glob.sync("./app/questions/*.js")
			},
	output: {
		path: path.join(__dirname, "/build/app"),
		filename: "[name].js"
	},
	module: {
		loaders: []
	},
	devServer: {
    	contentBase: './build/',
    	inline: true
  },
};