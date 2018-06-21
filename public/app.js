function localStorageList(name,max){
    if(!localStorage[name]) localStorage[name] = "[]";
    var list = JSON.parse(localStorage[name]);

    list.add = function(data){
       var index = $.inArray(data,list);
       if(index>=0) list.splice(index, 1);
       list.unshift(data);
       if(list.length>max) list.pop();
       localStorage[name]=JSON.stringify(list);
    };
    return list;
}

var access_list = localStorageList("access_list",10);
var run_command = localStorageList("run_command",100);

