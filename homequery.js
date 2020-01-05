var http = require('http');
var os = require( 'os' );
var url = require('url');
var fs = require('fs');

var mystyle="";
var myscript="";

function loadstylesheet(filename){
  fs.readFile(filename, function(err, data) {
    mystyle=data;
  });
}

function loadscript(filename){
  fs.readFile(filename, function(err, data) {
    myscript=data;
  });
}

function requestHandler(req, res) {
  //console.log("Yali CSS:"+ mystyle);
  //console.log("Yali js: "+ myscript);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<!DOCTYPE html>');
  res.write('<html><head>');

  res.write('<style>');
  res.write(mystyle);     //style sheet printed here
  res.write('</style>');
 
  res.write('</head><body>');
  res.write(  '<div id="tree"></div> <script>');

  res.write(myscript);

  res.write( '</script> <script>\'use strict\';');
  res.write(  " var tree = new Tree(document.getElementById('tree'), { navigate: true });");
  res.write(   'var structure = [');
  res.write(      "{  name: 'file 1x'},");
  res.write(      "{  name: 'file 2x'},");
  res.write(      "{  name: 'folder 1',  open: false,  type: Tree.FOLDER,  selected: false,");
  res.write(      "     children: [{    name: 'file 1/1'  },");
  res.write(      "                {    name: 'file 1/2'  }");
  res.write("]},{");
  res.write("name: 'folder 2 (asynced)',");
  res.write("type: Tree.FOLDER,");
  res.write("asynced: true");
  res.write(   '}];');
  res.write(   'tree.json(structure);');
  res.write('</script></body></html>');
  res.end();
  console.log("debug6");
}

loadscript("tree.js");
loadstylesheet("tree.css");

var server = http.createServer(requestHandler).listen(8081);
console.log("homequery ver 1.00");

var networkInterfaces = os.networkInterfaces( );
//var myip=networkInterfaces['Wi-Fi'][1]['address'];
var myip=networkInterfaces['eth1'][0]['address'];
console.log("Use this url:  http://"+myip+":8081/")

