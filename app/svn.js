const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;


router.get('/list', (req, res)=>{
    var msg ="";
    if(req.query.update==="true"){
        msg+= exec("svn --non-interactive update", {cwd: req.query.path}).toString();
    }
    
    var stat = exec("svn --non-interactive st", {cwd: req.query.path}).toString();
    var inf = exec("svn --non-interactive info", {cwd: req.query.path}).toString();
    res.json({stat:stat,msg:msg,inf:inf});
});


router.post('/commit', (req, res)=>{

    var msg ="";
    if(req.body.add){
        msg+=exec("svn add "+req.body.add.join(" "), {cwd: req.body.path}).toString();
    }
    
    if(req.body.delete){
        msg+=exec("svn del "+req.body.delete.join(" "), {cwd: req.body.path}).toString();
    }
    if(req.body.revert){
        msg+=exec("svn revert --non-interactive  "+req.body.revert.join(" "), {cwd: req.body.path}).toString();
    }
   
    //if(req.body.ignore){
    //    msg+=execSync("svn  --set-depth empty update "+req.body.ignore.join(" "), {cwd: req.query.path}).toString();
    //}   
   
    if(req.body.commit){
        var comment = ' -m "'+req.body.msg+'" ';
        msg+=exec("svn commit --non-interactive --force-log "+comment+req.body.commit.join(" "), {cwd: req.body.path}).toString();  
    }

    res.json({msg:msg});

});
function exec(cmd,opt){
    try{
         return execSync(cmd, opt).toString();
    }catch(e){
        return "<span style='color:red;'>"+e.message+"</span>";
    }
}
module.exports = router;
