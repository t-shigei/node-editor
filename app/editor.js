const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const fs_ext = require('fs-extra');
const multer = require('multer');


router.get('/', (req, res)=>{
  res.render('layout.html');
});
/*
router.get('/edit/load', (req, res)=>{
  res.render('editor.html');
});
*/


//開くたびに取得するパターン
router.get('/tree2', function(req, res){

    
    if(req.query.base=="#"){
        res.json([{
            text:req.query.root,
            type:"folder",
            children:fs.readdirSync(req.query.root).length>0,
            id:req.query.root
        }]); 
        
    }else{
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
                }else{
                    ret.push({text:name,
                       type:"file",
                       id:full
                     });

                }
            }catch(e){}
            return ret;
        },[]);
        dirs.sort((a,b)=> a.text>b.text ? 1 : -1);
        res.json(dirs); 
    }
});

//一気にフォルダ構成を取得するパターン
router.get('/tree', (req, res)=>{

    const base_path = req.query.path;
    if(!fs.existsSync(base_path))
    {
        res.json([{text:"フォルダがありません。："+base_path}]);
        return;
    }
    const tree={text:base_path,
                 type:"folder",
                 id:base_path,
                 li_attr:{class:"jstree-no-dots"},
                 children:[]};
    tree.children = (function nest(folder){
      					      const files = fs.readdirSync(folder).reduce((ret,name) => {
      					          		const full = path.join(folder,name);
      					          		try{
      				                      if(fs.statSync(full).isFile()){
      					                         ret.push({text:name,id:full,type:"file"});
      					                    }else{
      					                         ret.push({text:name,
                                                   type:"folder",
                                                   id:full,
      					                                   children:nest(full)
                                                  });
      					                    }
      					          		}catch(e){}
      					                return ret;
      					       },[]);
      					       files.sort((a,b)=> a.icon === b.icon ? (a.text>b.text ? 1 : -1 ) : a.icon ? 1 : -1);
      					       return files;
					     })(base_path);
    res.json([tree]);
});


router.get('/file', (req, res)=>{
  fs.readFile(req.query.path, (err, data) => {
       res.json( err ? err.message : data.toString());
  });
});

router.post('/save', (req, res)=>{
  fs.writeFile(req.body.path,req.body.data,(err)=>{
    res.json({msg: err ?  `<div style='background-color:red;'><strong>エラー:</string>${err.message}</div>`
                         : "保存しました"});
  });
});


router.get('/edit/create', (req, res)=>{
  const full_path = path.join(req.query.parent,req.query.text);
  if(req.query.type==="file"){
    fs.writeFileSync(full_path);
  }else if(req.query.type==="folder"){
    fs.mkdirSync(full_path);
  }
  res.json({id:full_path});
});

router.get('/edit/delete', (req, res)=>{
  fs_ext.removeSync(req.query.id)
  res.json("");
});

router.get('/edit/rename', (req, res)=>{
  const new_path =  path.join(path.dirname(req.query.id),req.query.text);
  fs.renameSync(req.query.id,new_path);
  res.json({id:new_path});
});

router.get('/edit/move', (req, res)=>{
  const new_name = path.join(req.query.parent,path.basename(req.query.id));
  fs.renameSync(req.query.id,new_name);
  res.json({id:new_path});
});

router.get('/edit/copy', (req, res)=>{
  const new_name = path.join(req.query.parent,path.basename(req.query.id));
  fs_ext.copy(req.query.id,new_name);
  res.json({id:new_path});
});

router.get('/edit/download', (req, res)=>{
  res.download(req.query.file);
});

var upload = multer({ storage:  multer.memoryStorage() })
router.post('/edit/upload', upload.single('file'),(req, res)=>{
  const new_name = path.join(req.query.parent,path.basename(req.file.originalname));
  const exist = fs.existsSync(new_name);
  fs.writeFileSync(new_name,req.file.buffer);
  res.json({exist:exist,id:new_name,name:req.file.originalname});
});
module.exports = router;
