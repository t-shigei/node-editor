var range = require("ace/range").Range;

GrepPane={};

FileTree.addContextMenu(function(items,node,instance){
 if(instance.get_type(node) === "folder") {
    items.grep = {  label:"grep",
                    action:function(data){
                                GrepPane.create(node.id);
                           }
                  };
 }
}); 
                  

GrepPane.create = function(path){
    var tabindex = EditorTab.append({
                            text: '検索<span data-type="remove" style="margin-left:2px;">'+
                                       '<span class="k-icon k-font-icon k-i-x" style="margin:0;"></span></span>',
                            encoded: false,
                            content:　'<div style="height:100%;">'+
                                        '  検索パス：<span class="path" >'+path+'</span>'+
                                        '  <div>'+
                                        '    File Name<input type="text" class="filter" style="width:150px;" value="*" >'+
                                        '    除外フォルダ<input type="text" class="directory" style="width:150px;" value=".svn tmp log node*" >'+
                                        '    RegEx<input type="text" class="token" style="width:300px;">'+
                                        '    <button class="save">検索</button>'+
                                        '    <span class="state blinking" style=""></span>'+
                                        '  </div>'+
                                        '   <div>Ctrl+Dで中止</div><hr>'+
                                        '   <div class="editor" style="height:90%;"></div>'+
                                        '</div>'
                        });
    var cntnt = EditorTab.tab.contentElement(tabindex);
    var editor = new Editor($(cntnt).find(".editor")[0]);
    
    EditorTab.setCoseEvent(tabindex);
    
    setGrepEvent(cntnt,editor);
    
    $(cntnt).find("button").kendoButton();
    return editor;
};



function setGrepEvent(cntnt,editor){
    var base_path=$(cntnt).find(".path").text();
    $(cntnt).find(".token").keypress(function(e){
        if (e.keyCode == 13) {
            $(cntnt).find("button").click();
            return false;
        }
    });
    $(cntnt).find("button").click(function(){
        $(cntnt).find(".state").addClass("blinking").text("検索中・・");
        var socket = io({ path: '/grep'});
        editor.break=function(){
                socket.emit("break");
        };
        socket.on("data",function(data){
            editor.append(data);
        });
        socket.on("end",function(data){
            editor.append(data);
            $(cntnt).find(".state").removeClass("blinking").text("検索完了");
        });
        socket.emit("search",
                    {path:base_path,
                     directory:$(cntnt).find(".directory").val(),
                     filter:$(cntnt).find(".filter").val(),
                     token:$(cntnt).find(".token").val()}
        );
        return false;
    });  
/*
    editor.oncontextmenu = function(e) {
        e.preventDefault();
        if(!editor.jump){
            editor.jump = $("<button  style=' font-size:8px;position: absolute;z-index:9999;'>ファイルを表示</button>");
            editor.jump.click(function(){
                $(this).css({display:'none'});
                var d = editor.getLine().split(":");
                EditorTab.load(base_path+"/"+d[0],d[1]);
            });
            $("body").append(editor.jump);
        }
        if(editor.getLine().split(":").length>=3){
            editor.jump.css({left:e.pageX, top:e.pageY,display:'inherit'});
        }
        return false;
    };
*/
    editor.dblclick = function(e) {
       // if(editor.jump) editor.jump.css({display:'none'});
        var pos = e.getDocumentPosition();
        var data = editor.getLine(pos.row).split(":");
        if(data.length>=3 && pos.column <= data[0].length){
            EditorTab.load(base_path+"/"+data[0],data[1]);
        }
        return false;
    };

    editor.hover = function (e)
    {
        var pos = e.getDocumentPosition();
        var data = editor.getLine(pos.row).split(":");
        
        var sess = editor.getSession();
        if(GrepPane.marker){
            sess.removeMarker(GrepPane.marker);
        }
        if(data.length>=3 && pos.column <= data[0].length){
             GrepPane.marker =  sess.addMarker(new range(pos.row,0,pos.row,data[0].length),"marker1", "text", false); 
        }
    };
}