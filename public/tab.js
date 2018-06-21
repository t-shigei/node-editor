EditorTab={};


EditorTab.create = function(){
  var tab = $("#tabstrip").kendoTabStrip(
                        {
                          animation: false,
                          dataTextField: "title",
                          dataContentField: "content",

                        }
                     ).data("kendoTabStrip");
  //sort
  $("#tabstrip ul.k-tabstrip-items").kendoSortable({
      filter: "li.k-item",
      axis: "x",
      container: "ul.k-tabstrip-items",
      hint: function (element) {
          return $("<div id='hint' class='k-widget k-header k-tabstrip'><ul class='k-tabstrip-items k-reset'><li class='k-item k-state-active k-tab-on-top'>" + element.html() + "</li></ul></div>");
      },
      start: function (e) {
          tab.activateTab(e.item);
      },
      change: function (e) {
          var reference = tab.tabGroup.children().eq(e.newIndex);

          if (e.oldIndex < e.newIndex) {
              tab.insertAfter(e.item, reference);
          } else {
              tab.insertBefore(e.item, reference);
          }
      }
  });
  EditorTab.tab=tab;
};

EditorTab.append=function(obj,close){
    EditorTab.tab.append(obj);
    var tabindex = EditorTab.tab.items().length-1;
    EditorTab.tab.select(tabindex);
    return tabindex;
};

EditorTab.load=function(path,line_no){
    var file = path.split("/");
    file = file.length ==1 ? file[0].split("\\").pop() : file.pop();
    var tabindex = this.append({
                                text: file+'<span data-type="remove" style="margin-left:2px;">'+
                                           '<span class="k-icon k-font-icon k-i-x" style="margin:0;"></span></span>',
                                encoded: false,
                                content: editor_contents
                            });
                            
    var cntnt = EditorTab.tab.contentElement(tabindex);
    $(cntnt).find(".fullpath").text(path);
    $(cntnt).find(".save").click(function(){
        editor.save();
        return false;
    });
    $(cntnt).find("button").kendoButton();
    
    var editor = new Editor($(cntnt).find(".editor")[0]);
    editor.loadData(path);
    editor.saveCallback=function(msg){
        Notice.show(msg,"success");
    };

    this.setCoseEvent(tabindex,function(item){
          if(editor.modify){
            if(confirm("変更箇所があります。保存しますか?")){
              editor.save();
            }
          }
    });
    if(line_no){
        editor.loadComplete = function(){
            editor.gotoLine(line_no);
        };
    }
    
};




EditorTab.closeAll=function(){
  EditorTab.tab.remove($("ul.k-tabstrip-items li.k-item"));
};


EditorTab.setCoseEvent=function(indx,callback){
    $(EditorTab.tab.items()[indx]).find("[data-type='remove']").click(function (e) {
          if(callback) callback(EditorTab.tab.items()[indx]);
          //if(tab.items()[indx].editor && tab.items()[indx].editor.editor.modify){
         //   if(confirm("変更箇所があります。保存しますか?")){
          //    tab.items()[indx].editor.save();
         //   }
         // }
          var item = $(e.target).closest(".k-item");
          EditorTab.tab.remove(item.index());
    
          if (EditorTab.tab.items().length > 0 && item.hasClass('k-state-active')) {
              EditorTab.tab.select(EditorTab.tab.items().length-1);
          }
          return false;
      });
};




