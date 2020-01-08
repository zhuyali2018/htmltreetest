var http = require('http');
var os = require( 'os' );
var url = require('url');
var fs = require('fs');
var readline = require('readline');


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

var array;     //line array loaded from inf file
function loadinffile(){
  fs.readFile('infomgr.inf', function(err, data) {
    if(err) throw err;
    array = data.toString().split("\n");
    load2array();
  });
}
function load2array(){
  mystuff=[];   //reset array before loading from line array
  for(i in array) {
     //console.log("making item #"+i);
     if (array[i]){
       makeitem(array[i]);
     }
  }
}
var mystuff=[];
function makeitem(line){
    var string = line.split("^");
    var id=string[0];
    var pid=string[1];   //parentid
    var name=string[2];
    var desp=string[3];
    var link=string[4];
    mystuff.push(string);
}
function showitem(res,string){
   var id=string[0];
   var pid=string[1];   //parentid
   if (nokids(res,id,string[2])){
      res.write( "{name:'"+string[2]+"-"+id+"="+pid+"'},");
   }
}
function nokids(res,id,pname){
  var flag=true;    //if no var here, flag is going to be shared among the stacked instances of the function
  var parentshown=false;
  for(i in mystuff) {   //loop through all
     if (mystuff[i]){   //if not empty
       myobj=mystuff[i];
       if(id == myobj[1]){    //check if id match any parent id
         flag=false;          //flag as having kids
         delete mystuff[i];   //delete
         if(!flag && !parentshown){
           res.write("{ name: '"+pname+"',  open: false,  type: Tree.FOLDER,  selected: false,  children: [ ");
           parentshown=true;
         }
         showitem(res,myobj);
       }
     }
  }
  if(!flag){
    res.write("]");
    res.write("},");
  }
  return flag;
}

function requestHandler(req, res) {
  //console.log("mystuff====>"+mystuff);
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
  //========================================
  for(i in mystuff) {
     var item=mystuff[i];
     delete mystuff[i];
     showitem(res,item);
  }
 // =======================================
  res.write(   '];');
  res.write(   'tree.json(structure);');
  res.write('</script></body></html>');
  res.end();
  console.log("Page done");
  loadinffile();    //reload inf file for next request
}

loadscript("tree.js");
loadstylesheet("tree.css");
loadinffile();
var server = http.createServer(requestHandler).listen(8081);
console.log("homequery ver 1.01");

var networkInterfaces = os.networkInterfaces( );
//var myip=networkInterfaces['Wi-Fi'][1]['address'];
var myip=networkInterfaces['eth1'][0]['address'];
console.log("Use this url:  http://"+myip+":8081/")

