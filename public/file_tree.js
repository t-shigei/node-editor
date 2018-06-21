FileTree={};

FileTree.load = function(path){
  //wait
  $("#filetree").jstree(true).settings.state.key=path;
  $("#filetree").jstree(true).settings.core.data={
                                          'url' : function (node) {return "/tree2?root="+encodeURIComponent(path)},
                                          'data': function (node) {return {base :  node.id }}
                                        };
  
  //("#filetree").jstree(true).settings.core.data=[{text:path,icon:"jstree-themeicon-hidden",li_attr:{class:"jstree-loading "}}];
  $("#filetree").jstree(true).refresh();

  
  //$.get("/tree",{path:path},function(data){
  //  $("#filetree").jstree(true).settings.core.data=data;
  //  $("#filetree").jstree(true).refresh();
  //},"json");
};

FileTree.create=function(){
        //フォルダTree
        $("#filetree").jstree({
            core:{
              data:[{id:"/",text: "選択されていません" }],
              force_text: true,
              check_callback: true,
            },
              sort:function (a, b) {
                  return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? -1 : 1);
              },
              state : { key : "filetree" },
              types: {
                        folder: {icon: 'jstree-folder' },
                        file: {valid_children: [],icon: 'jstree-file' }
                      },
              contextmenu:get_tree_contextmenu(),
              plugins:[ "contextmenu", "state","types","sort"]
 
        });

    set_tree_event();

}
FileTree.addContextMenu=function(callback){
    if(!FileTree.custom_menu) FileTree.custom_menu=[];
    FileTree.custom_menu.push(callback);
}


function get_tree_contextmenu(){
    return {items: function(node){
                  var items = $.jstree.defaults.contextmenu.items();
                  delete items.create.action;
                  items.upload = {label:"Upload",
                                action:function(data){
                                             $("<input type='file' >")
                                              .append("body")
                                              .change(function(){
                                                var inst = $.jstree.reference(data.reference);
                                                var obj = inst.get_node(data.reference);
                                                var formData = new FormData();
                                                formData.append('file', $(this).prop('files')[0]);
                                                $.ajax({url: '/edit/upload?parent='+encodeURIComponent(obj.id),method: 'post',dataType: 'json',
                                                        data: formData,
                                                        processData: false,
                                                        contentType: false})
                                                .done(function(res){
                                                  if(!res.exist){
                                                    inst.create_node(obj, {type:"file",id:res.id,text:res.name,uploaded:true }, "last");
                                                  }
                                                  $(this).remove();
                                                });
                                              })
                                              .click();
                                        }
                                };
                  items.download = {label:"Download",
                                  action:function(data){
                                      var inst = $.jstree.reference(data.reference);
                                      var obj = inst.get_node(data.reference);
                                      window.location.href="/edit/download?file="+encodeURIComponent(obj.id);
                                   }
                                  };       
                  items.create.label = "New";
                  items.create.submenu = {
                                        create_folder: {
                                          separator_after: true,
                                          label: "Folder",
                                          action: function (data) {
                                            var inst = $.jstree.reference(data.reference);
                                            var obj = inst.get_node(data.reference);
                                            inst.create_node(obj, { type : "folder" }, "last", function (new_node) {
                                              setTimeout(function () { inst.edit(new_node); },0);
                                            });
                                          }
                                        },
                                        create_file:{
                                          label: "File",
                                          action: function (data) {
                                            var inst = $.jstree.reference(data.reference);
                                            var  obj = inst.get_node(data.reference);
                                            inst.create_node(obj, { type : "file" }, "last", function (new_node) {
                                              setTimeout(function () { inst.edit(new_node); },0);
                                            });
                                          }
                                        }
                  };

                  if(this.get_type(node) === "file") {
                    delete items.create;
                    delete items.upload;
                  }else if(this.get_type(node) === "folder") {
                    delete items.download;
                  }else{
                    items={};
                  }
                  var instance =  this;  
                  if(FileTree.custom_menu) $.each(FileTree.custom_menu,function(){this(items,node,instance);});
                  return items;
            }
    }
                
        
    
}


function set_tree_event(){
    
    
    $('#filetree').on('refresh.jstree',function (e,obj) {
        obj.instance.restore_state();
    });
    
    //選択変更
    $('#filetree').on('select_node.jstree',function (e, selected) {
      if(selected.node.type==="file" && selected.event && selected.event.button!=2 ){
          var items = EditorTab.tab.items();
          for(var i=0;i<items.length;i++ ){
              if($(EditorTab.tab.contentElement(i)).find(".fullpath").text()===selected.node.id){
                  EditorTab.tab.select(i); 
                  return;
              }
          }
          EditorTab.load(selected.node.id); 
       }
    }).on('delete_node.jstree', function (e, data) {
      $.get('/edit/delete', {id:data.node.id },"json")
        .fail(function () {
          data.instance.refresh();
        });
    }).on('create_node.jstree', function (e, data) {
      //uploadで追加したものは再度追加しない
      if(!data.node.original.uploaded){
        $.get('/edit/create', {type:data.node.type,parent:data.node.parent,text:data.node.text },"json")
          .done(function (d) {
            data.instance.set_id(data.node, d.id);
          })
          .fail(function () {
            data.instance.refresh();
          });
      }
    }).on('rename_node.jstree', function (e, data) {
      $.get('/edit/rename', { 'id' : data.node.id, 'text' : data.text },"json")
        .done(function (d) {
          data.instance.set_id(data.node, d.id);
        })
        .fail(function () {
          data.instance.refresh();
        });
    })
    .on('move_node.jstree', function (e, data) {
      $.get('/edit/move', { 'id' : data.node.id, 'parent' : data.parent },"json")
        .done(function (d) {
          data.instance.refresh();
        });
    })
    .on('copy_node.jstree', function (e, data) {
      $.get('/edit/copy', { 'id' : data.original.id, 'parent' : data.parent },"json")
        .done(function (d) {
          data.instance.refresh();
        });
    }).on("show_contextmenu.jstree", function (e, data) {
        var $node = $('#'+data.node.id.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&')),
            $menu = $('.vakata-context').first(),
            $subMenu = $menu.find('ul');

       // $menu.offset({ top:  $node.offset().top + $node.height() - $menu.height() });
       // $subMenu.offset({top:  $menu.height()-$subMenu.height() });
    
    });

}


