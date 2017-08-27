var glob = require('glob');
var path = require('path');

module.exports = {
	entry: {'app' : glob.sync("./app/js/*.js"),},
	output: {
		path: path.join(__dirname, "/build/app/js"),
		filename: "[name].js"
	},
	module: {
		loaders: []
	},
	devServer: {
    	contentBase: './build/app',
    	inline: true
  },
};