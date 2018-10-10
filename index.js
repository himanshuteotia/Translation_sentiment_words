var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var google = require("./translate-api");
var xlsx = require('node-xlsx').default;
const multer = require("multer");
// const upload = multer({
//     dest: path.join(__dirname, 'uploads')
// });
let upload = multer();
const express = require("express");
const app = express();

app.use('/fileupload', upload.any(), async(req, res) => {
	console.log("file upload start");
    const workSheetsFromFile = xlsx.parse(req.files[0].buffer);
    let data = workSheetsFromFile[0].data.slice(1, workSheetsFromFile[0].data.length)
    var translatedArray = [];
    for (var i = data.length; i >= 0; i--) {
        if (data[i][0]) {
        	let translatedText = await google.googleTranslate({
                    "text": data[i][0],
                    "lang": "ms"
                })
            translatedArray.push([data[i][0], translatedText])
        }
    }
    res.status(200).send(translatedArray)
})

app.use(express.static('uploads'))

app.listen(3000, () => {
    console.log("server is running on 3000")
})

/*http.createServer(function async(req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
	  var newpath = __dirname + '/uploads/' + files.filetoupload.name;
	  fs.rename(oldpath, newpath, function (err) {
	    if (err) throw err;
	    let file = fs.readFileSync(__dirname + '/uploads/' + files.filetoupload.name);
	    const workSheetsFromFile = xlsx.parse(file);
	    let data = workSheetsFromFile[0].data.slice(1, workSheetsFromFile[0].data.length)
	    console.log(data);
	    var translatedArray = [];
	    for (var i = data.length - 1; i >= 0; i--) {
	    	if(data[i][0]) {
	    		let translatedPromise = new Promise(function(resolve,reject){
	    			resolve(google.googleTranslate({"text" :data[i][0], "lang" : "ms"}))
	    			reject("")
	    		});
	    		translatedPromise.then(function(value){
	    			console.log("value", value);
	    			translatedArray.push([data[i][0],value.text])
	    		}).catch(function(err){
	    			translatedArray.push([data[i][0],""])
	    		})
	    	}
	    }
	    console.log(translatedArray);
	    res.write('File translated and moved!');
	    res.end();
	  });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<p>File Upload : </p> <br>');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);*/