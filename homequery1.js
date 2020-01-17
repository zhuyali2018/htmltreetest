var http = require('http');
var os = require( 'os' );
var url = require('url');
var fs = require('fs');
var readline = require('readline');

var mystyle="";
var myscript="";

//load the style sheet for the html page
function loadstylesheet(filename){
  fs.readFile(filename, function(err, data) {
    mystyle=data;
  });
}

//load the tree java script
function loadscript(filename){
  fs.readFile(filename, function(err, data) {
    myscript=data;
  });
}

var array;       //line array loaded from inf file
var mystuff=[];  //array holding all items here

function loadinffile(){
  fs.readFile('infomgr.inf', function(err, data) {
    if(err) throw err;
    array = data.toString().split("\n");
    load2array();
  });
}

///////////////////////////////////////////
// Push items from array to mystuff array
// array is a line array
// mystuff is an object array
function load2array(){
  mystuff=[];   //reset array before loading from line array
  for(i in array) {
     if (array[i]){
       makeitem(array[i]);
     }
  }
}

function IsRoot(pids){
  return IsMyParent("0",pids);
}

function IsMyParent(id,pids){
  var pidline=""+pids.parents;
  var pidsarray=pidline.split("-");
  var pids2="";   //a var for outputing the pid list updated
  var flag=false;  //return value
  for(var i in pidsarray){
    if (id==pidsarray[i]){
       flag=true;
    }else{
      if(pids2=="")
        pids2=pidsarray[i];
      else
        pids2=pids2+"-"+pidsarray[i];
    }
  }
  pids.parents=pids2;
  return flag;
}

function makeitem(line){
    var string = line.split("^");
    mystuff.push(string);   //store the item in the array
}

//display the item delimited in a string
function showitem(res,string){
   var id=string[0];
   var pid=string[1];   //parentid
   var nme=string[2];   //name
   var img=string[3];   //image link
   var dsp=string[4];   //despcriptio
   var dtl=string[5];   //dtail
   //if (nokids(res,id,string[2])){     //if nokids, display the object simple below
   if (nokids(res,id,string)){     //if nokids, display the object simple below
      //res.write( "{name:'"+string[2]+"-"+id+"="+pid+"'},");
      res.write( "{name:'"+string[2]+"',");
      res.write( " imag:'"+string[3]+"',");
      res.write( " desp:'"+string[4]+"'},");
   }
}
function nokids(res,id,string){
  var flag=true;    //if no var here, flag is going to be shared among the stacked instances of the function
  var parentshown=false;    //flag for folder displaying html starting tag
  for(var i in mystuff) {   //loop through all items
     if (mystuff[i]){       //if not empty
       myobj=mystuff[i];
       var mypids;
       var mypids = {parents:''};     //using the property structure to get updated pid list from the function
       mypids.parents=myobj[1];
       if(IsMyParent(id,mypids)){  //is id one of the parents ?
         flag=false;          //flag as having kids
         if(mypids.parents==""){   //if no more parent
            delete mystuff[i];     //delete the item
         }else{
            mystuff[i][1]=mypids.parents;   //if more parents to be attaced to in tree, just update list and leave it in the list
         }
         if(!flag && !parentshown){  //display the item with kids under it  
           //res.write("{ name: '"+pname+"',  open: false,  type: Tree.FOLDER,  selected: false,  children: [ ");
           res.write("{ name: '"+string[2]+"', ");
           res.write(" imag: '"+string[3]+"',");
           res.write(" desp: '"+string[4]+"',");
           res.write(" open: false,  type: Tree.FOLDER,  selected: false,  children: [ ");
           parentshown=true;         //remember the parent structure already printed, do it only once for all kids that follow 
         }
         showitem(res,myobj);        //show kids one by one
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
  if (req.url == "/") {   //main page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<!DOCTYPE html>');
    res.write('<html><head><meta charset="UTF-8"></head>');
    res.write('<frameset  cols="30%,70%" frameborder="1">');
    res.write('   <frame name="frame1" src="homestufftree.html">');
    res.write('   <frameset rows="30%,70%" frameborder="1">');
    res.write('      <frame name="frame2" src="description.html">');
    res.write('      <frame name="frame3" src="detail.html">');
    res.write('   </frameset>');
    res.write('</frameset>');
    res.write('</html>');
    res.end();
    console.log("Main Page done");
  }else if(req.url == '/homestufftree.html'){
     console.log("requestiong page 1:"+req.url);
     res.writeHead(200, { 'Content-Type': 'text/html' });
     res.write('<!DOCTYPE html>');
     res.write('<html><head><meta charset="UTF-8">');
     res.write('<style>');
     res.write(mystyle);     //style sheet printed here
     res.write('</style>');
     res.write('</head><body>');
     res.write(  '<div id="tree"></div> <script>');
     res.write(myscript);
     res.write( '</script> <script>\'use strict\';');
     res.write(  " var tree = new Tree(document.getElementById('tree'), { navigate: true });");
     res.write(  "tree.on('created', (e, node) => { e.node = node; });");
     res.write(  "tree.on('open', e => console.log('open', e));");
     res.write(  "tree.on('select', e => { ");
     res.write(  "   try { ");
     res.write(  "         parent.frames['frame2'].document.getElementById ('desp').innerHTML=e.node.desp;");
     //res.write(  "   console.log(e);");
     //res.write(  "   console.log(e.node);");
     //res.write(  "   console.log(e.node.desp);");
     res.write(  "   }catch(err){ ");
     res.write(  "      console.log('Error caught: '+err);");
     res.write(  "   }");
     res.write(  " });");

     res.write(  "tree.on('action', e => console.log('action', e));");
     res.write(  "tree.on('fetch', e => console.log('fetch', e));");
     res.write(  "tree.on('browse', e => console.log('browse', e));");
     
     res.write(   'var structure = [');
     //==============loop through and display root nodes only==========================
     for(var i in mystuff) {
        var item=mystuff[i];
        var mypids = {parents:''};
        mypids.parents=item[1];      //doing it this way can pass updated pids back out
        if(IsRoot(mypids)){
           showitem(res,item);       //show the root item
           if(mypids.parents==""){
               delete mystuff[i];   //delete if this is the only instances
           }else{
               mystuff[i][1]=mypids.parents;    //update pid list if more than one instances
           }
        }
     }
    // =======================================
     res.write(   '];');
     res.write(   'tree.json(structure);');
     res.write('</script></body></html>');
     res.end();
     console.log("Page done");
     loadinffile();    //reload inf file for next request

     //--------------------------------------------------------------------
     console.log("home stuff tree done");
  }else if(req.url == '/description.html'){
     console.log("requestiong page 2:"+req.url);
     res.write('<!DOCTYPE html>');
     res.write('<html><head><meta charset="UTF-8">');
     res.write('<h2><center>description</center></h2>');
     res.write('</head><body>');
     res.write('<p id="desp">description</p>');
     res.write('</body>');
     res.write('</html>');
     res.end();
     console.log("description page done");

  }else if(req.url == '/detail.html'){
     console.log("requestiong page 3:"+req.url);
     res.write('<!DOCTYPE html>');
     res.write('<html><head><meta charset="UTF-8"></head>');
     res.write('<body>');
     res.write('<center>stuff detail</center>');
     res.write('</body>');
     res.write('</html>');
     res.end();
     console.log("detail page done");
  }else 
     console.log("requestiong page x:"+req.url);

}

loadscript("tree.js");
loadstylesheet("tree.css");
loadinffile();     //load tree data file infomgr.inf

var server = http.createServer(requestHandler).listen(8089);
console.log("homequery ver 2.00");

var networkInterfaces = os.networkInterfaces( );
//console.log(networkInterfaces);
//var myip=networkInterfaces['Wi-Fi'][3]['address'];
var myip=networkInterfaces['eth1'][0]['address'];
console.log("Use this url:  http://"+myip+":8089/")
