/**
 * Swagger API mockup.
 * @namespace SwaggerMockup
 */

/**
 * Swagger API mockup.
 * @memberof SwaggerMockup
 */
function ClientAuthorizations() {
	this.add = function(apiKey, apiKeyAuthorization) {};
};

var argsKeep;
/**
 * Swagger API mockup.
 * @memberof SwaggerMockup
 */
var SwaggerMockupClient = function(args) {
	argsKeep = args;
	this.clientAuthorizations = new ClientAuthorizations();
	/**
	 * Swagger API mockup.
	 * @memberof SwaggerMockup
	 */
	this.word = new function() {
		/**
		 * Swagger API mockup.
		 * @memberof SwaggerMockup
		 */
		this.getDefinitions = function(args, contentType, callback) {
			console.log('Inside mockup ' + args.word);
			var words = ['car', 'cloth', 'old', 'tore','i','I'];
			var response = words.indexOf(args.word) === -1 ? {
				obj: {
					length: 0
				}
			} : {
				obj: {
					word: args.word,
					length: 1
				}
			};
			callback(response);
		};
	}
	return this;
};
/**
 * Swagger API mockup.
 * @memberof SwaggerMockup
 */
SwaggerMockupClient.ApiKeyAuthorization = function(v1, v2, v3) {
	argsKeep.success();
};

module.exports = SwaggerMockupClient;