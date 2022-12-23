/* var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.filepath;
      var newpath = 'D:/node/resume-upload/uploads/' + files.filetoupload.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080); */

/* Node JS code starts here */
var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var textract = require('textract'); 
var db=require('./conn');
 
// html file containing upload form
var upload_html = fs.readFileSync("index.html");
 
// replace this with the location to save uploaded files
var upload_path = 'D:/node/resume-upload/uploads/';
 
http.createServer(function (req, res) {
    if (req.url == '/uploadform') {
      res.writeHead(200);
      res.write(upload_html);
      return res.end();
    } else if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            // oldpath : temporary folder to which file is saved to

            var oldpath = files.filetoupload.filepath; //upload_path; //files.filetoupload.path;
            var newpath = upload_path + files.filetoupload.originalFilename;
            var fileName = files.filetoupload.originalFilename;
            var fullPathWithPath = upload_path + fileName;
            // copy the file to a new location
            /* fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                // you may respond with another html page
                res.write('File uploaded and moved!');
                res.end();
            }); */
            
            // Read the file
            fs.readFile(oldpath, function (err, data) {
                if (err) throw err;
                console.log('File read!');
                // Insert query
                var sql = "INSERT INTO `files`(`name`, `path`) VALUES ('" + fileName + "', '" + upload_path + "')";
                var query = db.query(sql);
    
                // Write the file
                fs.writeFile(newpath, data, function (err) {
                    if (err) throw err;
                    res.write('File uploaded and moved!');
                    res.end();
                    console.log('File written!');
                });
    
                // Delete the file
                fs.unlink(oldpath, function (err) {
                    if (err) throw err;
                    console.log('File deleted!');
                });

                /* var data = textract.fromFileWithPath(fullPathWithPath, function( error, text ) {
                  console.log(JSON.stringify(text.split(":")));
                  console.log(JSON.stringify(text));
                }) */

            });
        });
    } 
}).listen(100);

/* Express JS code Starts here */
var cors = require('cors')
var morgan = require('morgan');
const express = require('express');
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors())
app.use(morgan('dev'));

// Expose the API to get the data.
app.post('/getData', (req, res) => {
  var reqFileName = req.body;
  console.log("body", req);
  console.log("filname",reqFileName);
  var data = textract.fromFileWithPath(upload_path + reqFileName.filename, function( error, text ) {
     res.send(JSON.stringify(text.split(":")));
   })
});

let port = 800;
app.listen(port, () => {
  console.log(`Express app listening on port ${port}`)
})