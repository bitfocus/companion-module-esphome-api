const path = require('path')

module.exports = {
	externals: function (context, request, callback) {
		if (request === '@companion-module/base') {
			return callback(null, 'commonjs @companion-module/base')
		}
		callback()
	},
}