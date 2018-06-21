$(function(){

var console_html=`
        <div id="shell-dialog" title="コマンド" >
          <div class="consl" style="height:100%;">
            <div>
                <button @click="clear">クリア</button>
                <button @click="suspend">Break(ctrl+d)</button>
                <button @click="copy_paste">コピペ(右 Click)</button>
            </div>
            <hr/>
            <pre style="height:90%;overflow-y:scroll;"  
                 @contextmenu="contextmenu" 
                 @mousedown="mousedown"  
                 ref="console">
<span v-html="console"></span><span><input style="width:60%;" @keyup.enter="enter" ref="cmd" type="text"></span></pre>
          </div>
        </div>`;
        
    $("body").append(console_html);
        
    //console 画面のpopup
    $('#shell-dialog').kendoWindow({
                width: "600px",
                height: "500px",
                title: "command console",
                visible: false,
                actions: ["Close"]
            });

  //console操作
  var Console = new Vue({el:".consl",
                       data:{console:"",socket:null},
                       mounted: function () {
                         var self=this;

                           this.socket = io({ path: '/shell'});
                           this.socket.on("data",function(data){
                             self.console+=data;
                             self.$refs.console.scrollTop = self.$refs.console.scrollHeight-20;
                           });
                           //cmdはkendoAutoCompleteを利用するのでv-modelでbindできない
                           $(this.$refs.cmd).kendoAutoComplete({
                               dataSource: {data: run_command}
                           });
                       },
                       methods:{
                         clear:function(e){
                           this.console="#";
                           this.$refs.cmd.focus();
                         },
                         suspend:function(e){
                           this.socket.emit("break","");
                         },
                         copy_paste:function(e){
                           document.execCommand('copy');
                           this.$refs.cmd.value+=this.getSelectionText();
                           this.$refs.cmd.focus();
                         },
                         enter:function(e){
                           $(this.$refs.cmd).kendoAutoComplete("close");
                           this.socket.emit("input",this.$refs.cmd.value);
                           run_command.add(this.$refs.cmd.value);
                           var ds = $(this.$refs.cmd).data("kendoAutoComplete");
                           ds.setDataSource({data:run_command});
                           this.$refs.cmd.value="";
                         },
                         contextmenu:function(e){
                           e.preventDefault();
                           return false;
                         },
                         mousedown:function(e){
                           if(e.button === 2) this.copy_paste();
                         },
                         getSelectionText(){
                             var text = "";
                             if (window.getSelection) {
                                 text = window.getSelection().toString();
                             } else if (document.selection && document.selection.type != "Control") {
                                 text = document.selection.createRange().text;
                             }
                             return text;
                         }

                       }
                      });


 //vueだと@keyup.ctrl.68
  $(document).keydown(function(e){
      //ctrl+d
      if(e.ctrlKey && e.keyCode === 68){
         Console.suspend();
         return false;
      }
  });

});

