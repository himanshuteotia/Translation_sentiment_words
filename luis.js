require('request');
const rp = require('request-promise');

let URL = `https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment`

let headers = {
    'Ocp-Apim-Subscription-Key': "47563a5f0bf045fd93071a67bd294937",
    'Content-Type': "application/json",
    'Content': "application/json"
}
exports.getTextSentiment = async(text) => {
    // return text;
    console.log("Text : ", text);
    var options = {
        method: 'POST',
        uri: URL,
        body: {
            "documents": [{
                "language": "en",
                "id": "1",
                "text": text
            }]
        },
        headers,
        json: true // Automatically stringifies the body to JSON
    };
    try {
    	let data = await rp(options)
    	console.log("result : ", data);
    	return data.documents[0].score;
    } catch(err) {
    	return null;
    }
        // .then(function(parsedBody) {
        //     // POST succeeded...
        //     console.log("parsedBody",parsedBody);
        //     try{
        //     } catch(err) {
        //     	return null
        //     }
        // })
        // .catch(function(err) {
        //     // POST failed...
        //     return null;
        // });

}