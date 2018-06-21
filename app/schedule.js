const router = require('express').Router();
const fs = require('fs');
const path = require('path');



router.get('/json', (req, res)=>{
    fs.readFile("/var/www/portal/schedule.mbsd",(err,data)=>{
        res.json(JSON.parse(data));
    });
});
router.post('/save', (req, res)=>{
    fs.readFile("/var/www/portal/schedule.mbsd",(err,data)=>{
        j =JSON.parse(data);
        j.forEach((obj)=>{
            if(obj.id==req.body.data.id){
                Object.assign(obj, req.body.data);
                obj.start_date=obj.start_date.replace(/-/g,"/");
                obj.end_date=obj.end_date.replace(/-/g,"/");
            }
        });
        fs.writeFile("/var/www/portal/schedule.mbsd",JSON.stringify(j, null, '\t'),(err)=>{
            res.json(j);
        });
    });
});
router.post('/new', (req, res)=>{
    fs.readFile("/var/www/portal/schedule.mbsd",(data)=>{
        j =JSON.parse(data);
        j.push(req.body.data);
        fs.writeFile("/var/www/portal/schedule.mbsd",JSON.stringify(j, null, '\t'),()=>{
            res.json("");
        });
    });
});

module.exports = router;
