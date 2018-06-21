Subversion={};


FileTree.addContextMenu(function(items,node,instance){
 if(instance.get_type(node) === "folder") {
     items.svn = {  label:"svn",
                        action:function(data){
                                    Subversion.create(node.id);
                               }
     }
 }
}); 

Subversion.create = function(path){
    const tabindex = EditorTab.append({
                            text: 'SVN<span data-type="remove" style="margin-left:2px;">'+
                                       '<span class="k-icon k-font-icon k-i-x" style="margin:0;"></span></span>',
                            encoded: false,
                            content:　'<form style="height:100%;" class="svn_form">'+
                                        '  BASEパス：<span >'+path+'</span>'+
                                        '  <input type="hidden" name="path" value="'+path+'">'+
                                        '    <button class="update" >Update</button>'+
                                   
                                        '    <input type=text name="msg" />'+
                                        '    <button class="commit">COMMIT</button>'+
                                       
                                        '   <div class="svn" style="margin-top:30px;height:90%;overflow:scroll;">'+
                                        '      <div class="table" style="float:left;width:40%;"></div>'+
                                        '      <div style="float:left;width:50%">'+
                                        '        <div class="inf" ></div>'+
                                        '        <div class="log" ><pre></pre></div>'+
                                        '      </div>'+
                                        '  </div>'+
                                        '</form>'
                        });
                        
    //close                    
    EditorTab.setCoseEvent(tabindex);
    var cntnt = EditorTab.tab.contentElement(tabindex);
    
    //reload
    $(cntnt).find(".update").click(function(){
        Subversion.list(cntnt,true);
        return false;
    });
    
    //update list
    Subversion.list(cntnt,false);

    //commit
    $(cntnt).find(".commit").click(function(){
        $.post("/svn/commit", $(cntnt).find(".svn_form").serialize(),function(ret){ 
           $(cntnt).find(".svn .log pre").append(ret.msg);
           Subversion.list(cntnt);
        });
        return false;
    });
    
    $(cntnt).find("button").kendoButton();
};



Subversion.list=function(content,update){
    var path = $(content).find("[name=path]").val();
    $.get("/svn/list",{path:path,update:update},function(ret){
        $(content).find(".svn .inf").html("<pre>"+ret.inf+"</pre>");
        $(content).find(".svn .log pre").append(ret.msg);
        
        var $tbl = $("<table border=1><tr><th>status</th><th>check</th><th>path</th><th>revert</th></tr></table>");
        var lines = ret.stat.split("\n");
        for(var i=0;i<lines.length;i++){
            var $tr = $("<tr></tr>");
            var st = lines[i].split(/\s+/);
            if(st.length<2) continue;
            if(st[0]==="M"){
                $tr.append("<td>更新</td><td><input name=commit[] type=checkbox value='"+st[1]+"' checked></td>"+
                 "<td>"+st[1]+"</td><td><input name=revert[] type=checkbox value='"+st[1]+"' ></td>");
            }else if(st[0]==="A"){
                $tr.append("<td>追加</td><td><input name=commit[] type=checkbox value='"+st[1]+"' checked></td>"+
                           "<td>"+st[1]+"</td><td>-</td>");
            }else if(st[0]==="?"){
                $tr.append("<td>追加</td><td><input name=add[] type=checkbox value='"+st[1]+"'></td>"+
                           "<td>"+st[1]+"</td><td>-</td>");
            }else if(st[0]==="D"){
                $tr.append("<td>削除</td><td><input name=commit[] type=checkbox value='"+st[1]+"' checked></td><td>"+st[1]+"</td><td>-</td>");
            }else if(st[0]==="!"){
                $tr.append("<td>削除</td><td><input name=delete[] type=checkbox value='"+st[1]+"'>"+
                           "</td><td>"+st[1]+"</td><td>-</td>");

            }
            $tbl.append($tr);
        }
        
        $(content).find(".svn .table").html("");
        $(content).find(".svn .table").append($tbl);
    },"json");
}

