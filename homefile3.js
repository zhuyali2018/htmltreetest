var http = require('http');
var os = require( 'os' );
var url = require('url');
var fs = require('fs');

var mystyle="";
function loadstylesheet(filename){
  fs.readFile(filename, function(err, data) {
    mystyle=data;
  });
}
 
function requestHandler(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<!DOCTYPE html>');
  res.write('<html><head>');
  res.write('<h2> This is title </h2>');
  res.write('<style>');
  res.write(mystyle);     //style sheet printed here
  res.write('</style>');
  res.write('</head><body>');
  res.write('This is body text');
  res.write('</body></html>');
  res.end();
}

loadstylesheet("yali.css");

var server = http.createServer(requestHandler).listen(8083);
console.log("homequery ver 1.00");

var networkInterfaces = os.networkInterfaces( );
//var myip=networkInterfaces['Wi-Fi'][1]['address'];
var myip=networkInterfaces['eth1'][0]['address'];
console.log("Use this url:  http://"+myip+":8083/")

