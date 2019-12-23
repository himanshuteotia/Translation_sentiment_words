var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var google = require("./translate-api");
var textAnalysis = require("./luis");
var xlsx = require('node-xlsx').default;
const multer = require("multer");
var XLSX = require('xlsx')
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


function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';
			
			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

app.use('/luis-sentiment', upload.any(), async(req,res) => {
	const workSheetsFromFile = xlsx.parse(req.files[0].buffer);
	// console.log(workSheetsFromFile);
    let data = workSheetsFromFile[0].data.slice(1, workSheetsFromFile[0].data.length)
    // for (var i = data.length - 1; i >= 0; i--) {
    for (var i = 0; i < data.length; i++) {
    	if(data[i][0]) {
    		let text = await textAnalysis.getTextSentiment(data[i][0])
    		data[i][1] = text; 
    	}
    }

    let ws_name = 'index';
    function Workbook() {
		if(!(this instanceof Workbook)) return new Workbook();
		this.SheetNames = [];
		this.Sheets = {};
	}
	var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);
	/* add worksheet to workbook */
	wb.SheetNames.push(ws_name);
	wb.Sheets[ws_name] = ws;

	/* write file */
	XLSX.writeFile(wb, 'test.xlsx');
	// res.download('test.xlsx');

    res.status(200).send(data)
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