// http://api.wordnik.com:80/v4/word.json
// 'use strict';

var client = require('swagger-client');

var swagger = new client({
  // url: 'http://petstore.swagger.io/v2/swagger.json',
  url: 'http://api.wordnik.com:80/v4/word.json',
  // key: 'eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae',
  success: function() {
    // swagger.pet.getPetById({petId:7},{responseContentType: 'application/json'},function(pet){
    	// eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae
    	swagger.word.getWord({word:'carses'},{responseContentType: 'application/json'},function(response){
      console.log(response.obj.hasOwnProperty("canonicalForm")? response.obj.word + ' exists': response.obj.word + ' does not exist');
      console.log('=== response ===');
      console.log(response);
      console.log('=== this ===');
      console.log(this);
      console.log('=== swagger ===');
      console.log(swagger.word);
      console.log('======');
    });
  }
});

swagger.clientAuthorizations.add("apiKey", new client.ApiKeyAuthorization("api_key","eddc3027033322a3a96080687ee0d8fab8ba52dca55e97dae","query"));

console.log('=========');
 console.log(swagger);
console.log('=========');
console.log(swagger.apis);
console.log('=========');
console.log(swagger.apis.word);
console.log('=========');

// swagger.getWord({word:'car'},{responseContentType: 'application/json'},function(pet){
//     console.log('pet', pet);
// });

