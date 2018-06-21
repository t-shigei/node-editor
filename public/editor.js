
//editor

var ext_list = {js:"ace/mode/javascript",
                c:"ace/mode/c_cpp",
                php:"ace/mode/php",
                rb:"ace/mode/ruby",
                rake:"ace/mode/ruby",
                py:"ace/mode/python",
                bat:"ace/mode/batchfile",
                sh:"ace/mode/sh",
                css:"ace/mode/css",
                json:"ace/mode/json",
                html:"ace/mode/html",
                xml:"ace/mode/xml",
                log:"ace/mode/asciidoc",
                sql:"ace/mode/sql",
                jsp:"ace/mode/jsp",
                java:"ace/mode/java",
                scala:"ace/mode/scala",
                ini:"ace/mode/ini",
                txt:"ace/mode/text",
                erb:"ace/mode/html_ruby",
                yml:"ace/mode/yaml",
              };

var editor_contents='<div style="height:100%;">'+
                    '  ファイルパス：<span class="fullpath" ></span>'+
                    '  <div>'+
                    '    <button class="save">保存(ctrl+s)</button>'+
                    '    <div style="float:right;">[検索:ctrl+f]&nbsp;[置換:ctrl+h]&nbsp;[次検索:ctrl+k]&nbsp;[前検索:ctrl+shift+k]&nbsp;</div>'+
                    '  </div>'+
                    '   <hr>'+
                    '   <div class="editor" style="height:90%;"></div>'+
                    '</div>';

function Editor(editor_id){
    var self=this;
    this.modify=false;

    this.editor = ace.edit(editor_id);

    this.editor.setTheme("ace/theme/monokai");


    this.editor.getSession().on('change', function() {
       self.modify=true;
    });



    this.editor.commands.addCommand({
        name: "save",
        exec: function() {self.save();},
        bindKey: {win: "ctrl-s",mac: "cmd-s"}
    });
    this.editor.commands.addCommand({
        name: "break",
        exec: function() {self.break();},
        bindKey: {win: "ctrl-d",mac: "cmd-d"}
    });
    this.editor.container.addEventListener('contextmenu', function(e) {
        return self.oncontextmenu ? self.oncontextmenu(e): false;
    });
    this.editor.on('click',function(e) {
        return self.click ? self.click(e): false;
    });
    this.editor.on('dblclick',function(e) {
        return self.dblclick ? self.dblclick(e): false;
    });
    
    this.editor.on("mousemove", function (e)
    {
        return self.hover ? self.hover(e): false;
    });

}
Editor.prototype.break=function(){
  Console.suspend();
};
Editor.prototype.saveCallback=function(msg){
  alert(msg);
};

Editor.prototype.loadData=function(path){
      if(!path) return;
      this.path=path;
      this.setData("");
      this.editor.getSession().setMode("ace/mode/asciidoc");
      var self = this;
      $.get("/file",{path:path},function(file){
          var ext = path.split('.').pop();
          self.editor.getSession().setMode(ext_list[ext]||"ace/mode/asciidoc");
          self.setData(file);
          if(self.loadComplete) self.loadComplete();
      },"json");
};

Editor.prototype.save=function(){
  if(!this.path) return;
   var self = this;
   $.post("/save",{path:self.path,data:self.editor.getValue()},
                   function(ret){
                      self.modify=false;
                      self.saveCallback(ret.msg);
                   },"json");
};
Editor.prototype.getSession=function(dt){
    return  this.editor.getSession();
};
Editor.prototype.setData=function(dt){
    this.editor.focus();
    this.editor.setValue(dt,-1);
    this.modify=false;
};
Editor.prototype.append=function(dt){
    this.editor.focus();
    var sess = this.editor.getSession();
    var row = sess.getLength();
    sess.insert({row:row ,column: 0},dt);
};

Editor.prototype.getLine=function(no){
    return this.editor.session.getLine(no ? no:this.editor.getCursorPosition().row);
};
Editor.prototype.gotoLine=function(no){
    this.editor.resize(true);
    this.editor.scrollToLine(no, true, true, function () {});
    this.editor.gotoLine(no, 0, true);
};




