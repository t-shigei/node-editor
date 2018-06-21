process.on('unhandledRejection', function (err, p) {
    console.log(p);
    console.log("Promiseのcatch忘れエラーです\nunhandledRejection:"+err.message);
    console.log(err.stack);
});

process.on('uncaughtException', function (err) {
  console.error("致命的なエラーです(uncaughtException):"+err.message);
  console.error(err.stack);
});

const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const socket = require('socket.io');
const conf = require('config');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit:'500mb',extended: true }));
app.use(cookieParser());

app.use('/static',express.static('public'));

app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});


app.get('/dir_tree', function(req, res){
    const base_path = req.query.base;
    const dirs = fs.readdirSync(base_path).reduce((ret,name) => {
        		const full = path.join(base_path,name);
            try{
              if(fs.statSync(full).isDirectory()){
                 ret.push({text:name,
                           type:"folder",
                           children:fs.readdirSync(full).length>0,
                           id:full
                         });
              }
            }catch(e){}
            return ret;
        },[]);
				dirs.sort((a,b)=> a.text>b.text ? 1 : -1);
    res.json(dirs);
});


app.use('/',require('./editor'));
require('./console')(socket(http, { path: '/shell'}));
require('./grep')(socket(http, { path: '/grep'}));
app.use('/svn', require('./svn'));

app.use('/schedule', require('./schedule'));

/// catch 404
app.use((req, res, next) =>
          res.type('txt').status(404).send('Page not Found') );

/// 500 error
app.use((err, req, res, next) =>{
  if (res.headersSent)
    return next(err);
  else
     res.type('txt').status(500).send(err.message+"\n"+err.stack);
});

http.listen(conf.listenPort);
