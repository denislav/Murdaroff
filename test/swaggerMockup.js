'use strict';

var SwaggerMockupClient = function(args){
	args.success();
};

SwaggerMockupClient.prototype.ApiKeyAuthorization = function (v1,v2,v3){};

SwaggerMockupClient.prototype.clientAuthorizations = function(){};

SwaggerMockupClient.prototype.clientAuthorizations.prototype.add = function(apiKey, apiKeyAuthorization, callback){ 
		callback();
	};

SwaggerMockupClient.prototype.word = function(){};

SwaggerMockupClient.prototype.word.prototype.getDefinitions = function(args, contentType, callback){
	console.log( 'Inside mockup ' + args.word);
	var response = {
		obj: {length : 0}
	};			      	
	callback(response);
};


module.exports = SwaggerMockupClient;