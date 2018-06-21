var Scheduler_body_contents = `
<div>
  <a href="" class="pre_month">◀前月</a>
  <select class="display_months">
    <option value="2">2か月</option>
    <option value="3">3か月</option>
    <option value="4">4か月</option>
  </select>
  <a href="" class="next_month">翌月▶</a>
  <a href="" class="schedule_refresh">再描画</a>
</div>
<div id="grpschedule" style="height:80%;font-size:9px;"></div>

<form class="schedule_edit" 
    style="display:none;position:absolute;top:100px;left:200px;
            border: 1px solid #000000;
            background:black;
            color:white;
            padding: 0px 10px 10px 10px;">
    <a href="" class="schedule_close" 
       style="    color: red;
        font-size: 15px;
        text-decoration: none;
        float: right;">×</a>
    <hr style="clear:right;">
    <div>id:<input type=text value="" name="id" /></div>
    <div>name:<input type=text value="" name="name" style="width:300px;"/></div>
    <div>from:<input type=date value="" name="start_date" />to:<input type=date value="" name="end_date" /></div>
    <div>color:<input type=color value="" name="color" /></div>
    <div>進捗:<input type=text value="" name="status" /></div>
    <div><button class="schedule_save">保存</button></div>
</form>


<div class="schedule_show" 
    style="display:none;position:absolute;top:100px;left:200px;
            border: 1px solid #000000;
            background:black;
            color:white;
            padding: 0px 10px 10px 10px;">
    <div>id:<span class="id"></span></div>
    <div>name:<span class="name" style="width:300px;"></span></div>
    <div>from:<span class="start_date"></span></div>
    <div>to:<span class="end_date"></span></div>
    <div>進捗:<span class="status"></span></div>
</div>

`;


Scheduler={
    
    

    show: function(){
    
                if($("#grpschedule").length>0) return;
        
                const tabindex = EditorTab.append({
                                    text: 'schedule<span data-type="remove" style="margin-left:2px;">'+
                                               '<span class="k-icon k-font-icon k-i-x" style="margin:0;"></span></span>',
                                    encoded: false,
                                    content:　Scheduler_body_contents
                                });
                    //close                    
                EditorTab.setCoseEvent(tabindex);
                var cntnt = EditorTab.tab.contentElement(tabindex);
                this.set_event();
                var self = this;
                
                //data取得
                $.get("/schedule/json",function(ret){
                      $.each(ret,function(){if(!this.color) this.color=self.getRandomColor() });
                      $("#grpschedule").groupScheduler("set_data",ret);
                },"json");
                

                 $("#grpschedule").groupScheduler({
                       months: 2,
                       height: 15,
                       move:function(data){
                           $.post("/schedule/save",{data:data},function(ret){
                               $("#grpschedule").groupScheduler("set_data",ret);
                           });
                       },
                       name_click:function(data,obj){
                            self.showDetail(data,false);
                       },
                       data_click:function(data,obj){},
                       name_render:function(data,obj){
                           obj.html((data.start_date ? "&nbsp;&nbsp;&nbsp;&nbsp;" : "" )+data.name);
                       },
                       data_render:function(data,obj){
                           obj.hover(function(e){
                               $.each(data,function(k,v){
                                 $(".schedule_show ."+k+"").text(v);
                               });
                               $(".schedule_show").show();
                                $(".schedule_show").offset({top:e.clientY-70,left:e.clientX+10});
                           }, function(e){
                                $(".schedule_show").hide();
                           });
                       },
                  });  

        },
        set_event:function(){
                $(".pre_month").click(function(){
                    $("#grpschedule").groupScheduler("previous");
                    return false;
                });
                $(".next_month").click(function(){
                    $("#grpschedule").groupScheduler("next");
                    return false;
                });
                $(".display_months").change(function(){
                    $("#grpschedule").groupScheduler("set_months",$(this).val());
                    return false;
                });
                $(".schedule_refresh").click(function(){
                    $("#grpschedule").groupScheduler("refresh");
                    return false;
                });
                $(".schedule_close").click(function(){
                    $(".schedule_edit").hide();
                    return false;
                });
                $(".schedule_save").click(function(){
                    var data = {};
                    $each($(".schedule_edit").serializeArray(),function(i, obj){
                        data[obj.name] = obj.value;
                    });
                    $.post("/schedule/save",{data:data},function(ret){
                        $("#grpschedule").groupScheduler("set_data",ret);
                    });
                    $(".schedule_edit").hide();
                    return false;
                });
            
        },
        showDetail: function(data){
               $(".schedule_edit :input").val("");
               var self=this;
               $.each(data,function(k,v){
                 $(".schedule_edit :input[name="+k+"]").val(
                     (k==="start_date" || k==="end_date") ?  self.formatD(v) : v);
               });
               
               $(".schedule_edit").show();
        },
        getRandomColor: function(){
                  var letters = '0123456789ABCDEF';
                  var color = '#';
                  for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                  }
                  return color; 
        },
        formatD:function(ymd){
                    var d = new Date(ymd);	var date = new Date();
                	return  d.getFullYear() +  "-" +
                				('0' + (d.getMonth()+1)).slice(-2) + "-" +
                				('0' + d.getDate()).slice(-2);
        }
}


/*
 *  jquery groupScheduler plugin
 *  created by t.shigei
 *  Under MIT License
 *  
 *   
 * $("#grpschedule").groupScheduler({
 *      ym: new Date(),
 *      data: [],
 *      months: 2,
 *      height: 18,
 *      width: 16,
 *      move:function(data){
 *        $.post(...);
 *      },
 *      name_click:function(data){
 *        ....
 *      },
 *      data_click:function(data){
 *        ....
 *      },
 * });
 
 * $("#grpschedule").groupScheduler("set_data",[{name:"",start_date:"",end_date:"",color:""}]);
 * $("#grpschedule").groupScheduler("previous");
 * $("#grpschedule").groupScheduler("next");
 * $("#grpschedule").groupScheduler("set_months",3);
 * 
 * 
 */
;( function( $, window, document, undefined ) {

  "use strict";




    var pluginName = "groupScheduler",
      defaults = {
        ym: new Date(),
        data: [],
        months: 2,
        height: 18,
        width: 16,
        header:"",
        move:function(){},
      };

    function Plugin ( element, options ) {
      this.element = element;
      this.settings = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
    }

    $.extend( Plugin.prototype, {
      init: function() {
        var div = "<div class='schedule_names' style='float:left;overflow:hidden;' ><div class='schedule_title'></div><div class='schedule_body' style='overflow:hidden;position:relative;'></div></div>"+
                  "<div class='schedule_sep' style='cursor: ew-resize;float:left;'></div>"+
                  "<div class='schedule_base' style='overflow-x:auto;overflow-y:hidden;float:left;'><div class='schedule_header' style='position:relative;'></div><div class='schedule_body' style='overflow:hidden;position:relative;'></div></div>"+
                  "<div class='schedule_scroll' style='overflow-y:auto;width:30px;position: relative;float:left;'><div class='scroll_dummy'></div></div>";
        $(this.element).append(div);
        $(this.element).find(".schedule_title").text(this.settings.header);
        
        this.settings
        var self = this;
        $(self.element).find(".schedule_base,.schedule_names").on('wheel', function(e){
            var top = $(self.element).find(".schedule_scroll").scrollTop()+e.originalEvent.deltaY;
            $(self.element).find(".schedule_scroll").scrollTop(top);
            $(self.element).find(".schedule_scroll").scroll();
        });
        //scrollバー
        $(self.element).find(".schedule_scroll").on('scroll', function () {
            $(self.element).find(".schedule_names .schedule_body").scrollTop($(this).scrollTop());
            $(self.element).find(".schedule_base .schedule_body").scrollTop($(this).scrollTop());
        });
        
        //サイズ調整
        $(window).resize(function(){
            //データ領域の高さ
            var height = self.settings.height*self.settings.data.length;
            //schedule_bodyとscrollの高さを変更
            $(self.element).find(".schedule_day_pane").css("height",height);
            $(self.element).find(".scroll_dummy").css("height",height+20);
            
            //heightの設定がある場合はScroll表示
            if($(self.element).height()!==0){height=$(self.element).height();}
            
            $(self.element).find(".schedule_body").height(height);
            $(self.element).find(".schedule_scroll").height(height);
            $(self.element).find(".schedule_sep").height($(self.element).find(".schedule_header").height()+height);
            
            setPosition($(".schedule_names").width());
        });
        $(window).resize();
        //タイトルの幅変更セパレータ
        function setPosition(offset){
            $(".schedule_names").width(offset);
            //scroll barの幅を考慮
            var max_w =$(self.element).width()-offset-$(".schedule_sep").width()-50;
            if($(".schedule_header").width()<max_w) max_w=$(".schedule_header").width();
            $(".schedule_base").width(max_w);
        }

        var mouse_position=0;
        var start_width=$(".schedule_names").width();
        $('.schedule_sep').mousedown(function(e){mouse_position = e.pageX;});
        $(document).mouseup(function(e){
            mouse_position=0;
            start_width=$(".schedule_names").width();
        });
        $(document).mousemove(function(e){
            if(mouse_position!==0 ){
                setPosition(start_width + e.pageX-mouse_position);
            } 
        });
        
        //レンダリング
        this.schedule_render(this.settings.ym,this.settings.months);
        if(this.settings.data){
          this.set_data(this.settings.data);
        }
      },
      next: function(){
        var start = new Date(this.settings.ym);
        start.setMonth(start.getMonth()+1);
        this.settings.ym = start;
        this.schedule_render(this.settings.ym,this.settings.months);
        if(this.settings.data){
          this.set_data(this.settings.data);
        }
      },
      previous: function(){
        var start = new Date(this.settings.ym);
        start.setMonth(start.getMonth()-1);
        this.settings.ym = start;
        this.schedule_render(this.settings.ym,this.settings.months);
        if(this.settings.data){
          this.set_data(this.settings.data);
        }
      },
      set_months: function(mnth){
        this.settings.months = mnth;
        this.schedule_render(this.settings.ym,this.settings.months);
        if(this.settings.data){
          this.set_data(this.settings.data);
        }
      },
      refresh: function(){
        this.set_data(this.settings.data);
      },
      div_item: function(attr){
          var div = $("<div>"+attr.txt+"</div>");
          if(attr.class) div.attr("class",attr.class);
          if(attr.title) div.attr("title",attr.title);
          $.each(attr.style,function(k,v){
            div.css(k,v);
          });
          div.css("border","0.5px solid #c0c0c0");
          return div;
        },
      ymd_format: function(dt){
        try {
           if(typeof dt == "string"){dt = new Date(dt);}
           return dt.getFullYear()+"/"+(dt.getMonth()+1)+"/"+dt.getDate();
        }
        catch (e) {
           return "";
        }
      },
      day_left_position:function(date){
        if(typeof date == "string"){date = new Date(date);}
        var start =new Date(this.date_list[0]);
        var end = new Date(this.date_list[this.date_list.length-1]);
        if(start>date){
          return 0;
        }else if(end<date){
              return (this.date_list.length-1)*this.settings.width;
        }else{
          for(var i=0;i<this.date_list.length;i++){
            if(this.date_list[i]==this.ymd_format(date)){
              return i*this.settings.width;
            }
          }
        }

      },
      get_day: function(position){
        position=Math.round(position);
        if(position<this.settings.width){
          return this.date_list[0];
        }else if(position>=this.date_list.length*this.settings.width){
              return this.date_list[this.date_list.length-1];
        }else{
          for(var i=0;i<=this.date_list.length;i++){
            if(position<i*this.settings.width ){
              return this.date_list[i-1];
            }
          }
        }
      },
       last_day: function(dt){
        var current = new Date(dt.getTime());
        current.setMonth(current.getMonth()+1);
        current.setDate(0);
        return current.getDate();
      },
      schedule_render: function(ym,display){
        $(this.element ).find(".schedule_ym").remove();
        var start = new Date(ym);
        start.setDate(1);
        this.date_list=[];
        var total_width=0;
        for(var i=0;i<display;i++){
          //startから月数をプラス
          var current = new Date(start.getTime());
          current.setMonth(start.getMonth()+i);
          //最終日取得
          var lastdays = this.last_day(current);
          //データリスト作成
          for(var dd=1;dd<=lastdays;dd++){
            current.setDate(dd);
            this.date_list.push(this.ymd_format(current));
          }
          //ymのタイトル作成
          var style={};
          current.setDate(1);
          style.left=this.day_left_position(current);
          style.height=this.settings.height;
          style.width=lastdays*this.settings.width;
          style.position="absolute";
          total_width+=style.width;
          $(this.element).
                 find(".schedule_base .schedule_header").
                 append(this.div_item({class: "schedule_ym",
                                        style: style,
                                        txt: this.ymd_format(current)
                                      }));

        }
        //日付タイトル
        this.schedule_render_day();
        ////ヘッダの高さｙｍ＋日付＋曜日
        $(this.element).find(".schedule_title,.schedule_header").height(this.settings.height*3);
        //右のスクロールバーのtop位置調整
        $(this.element).find(".schedule_scroll").css("top",this.settings.height*3);
        
        //カレンダのWidthを設定
        $(this.element).find(".schedule_base .schedule_header,.schedule_base .schedule_body").width(total_width+5);         

      },
      schedule_render_day: function(){
        var WeekChars = [ "日", "月", "火", "水", "木", "金", "土" ];
        //前回データ削除
        $(this.element).find(".schedule_day,.schedule_sunday,.schedule_saturday").remove();
        var schedule_header=$(this.element).find(".schedule_base .schedule_header");
        for(var i=0;i<this.date_list.length;i++){
          //日付
          var d=new Date(this.date_list[i]);
          var today = this.ymd_format(new Date());
          var title=holiday[this.ymd_format(d)];
          
          var cls="schedule_day";
          if(this.ymd_format(d)==today){
              cls+=" schedule_current";
          }else if(d.getDay()===0 || title){ 
            cls+=" schedule_sunday";
          }else if(d.getDay()===6){
            cls+=" schedule_saturday";
          }
          
          var style={};
          style.top = this.settings.height;
          style.left=this.settings.width*i;
          style.height=this.settings.height;
          style.width=this.settings.width;
          style.position="absolute";
          schedule_header.append(this.div_item({class: cls,
                                  style: style,
                                  title: title,
                                  txt: d.getDate()
                                }));
          //曜日
          style.top = this.settings.height*2;

          schedule_header.append(this.div_item({class: cls,
                                            style: style,
                                            title: title,
                                            txt: WeekChars[d.getDay()]
                                          }));
          //schedule_bodyに縦に色つけたデータ領域を作成
          style.top =0;
          $(this.element).find(".schedule_base .schedule_body").append(this.div_item({class: cls+" schedule_day_pane",style: style,txt:"" }));
        }
      },
      set_data: function(datas){
        //jsonデータをレンダリング
        this.settings.data = datas;
        $(this.element).find(".schedule_data,.schedule_name").remove();
        //ベース部分を再描画
        $(window).resize();
        var obj=this;

        //データをレンダリング
        var name_body = $(this.element).find(".schedule_names .schedule_body");
        var schedule_body= $(this.element).find(".schedule_base .schedule_body");
        $.each(datas,function(i,d){
            //name表示
            var nstyle={
                top:obj.settings.height *i,
                height:obj.settings.height,
                position:"absolute",
                width:"100%",
                // background:d.color
            };
            var tmp =obj.div_item({class: "schedule_name",style: nstyle,txt: d.name,title:d.name});
          
            tmp.appendTo(name_body)
                .click(function(){
                            if(obj.settings.name_click) obj.settings.name_click(d,tmp);
                          });
            if(obj.settings.name_render) obj.settings.name_render(d,tmp);

            //データ表示
            //日付がないものは表示しない
            if(!d.start_date || !d.end_date){return true;}
            //期間外は表示しない
            try {
                if(new Date(d.start_date) > new Date(obj.date_list[obj.date_list.length-1])){return true;}
                if(new Date(d.end_date)<new Date(obj.date_list[0])){return true;}
            }catch (e) {return true;}
            
            //描画
            var dstyle={
                top:obj.settings.height *i,
                left:obj.day_left_position(d.start_date),
                width: obj.day_left_position(d.end_date)-obj.day_left_position(d.start_date)+obj.settings.width,
                height:obj.settings.height,
                position:"absolute",
                background:d.color
            };
            var tmp2 = obj.div_item({class: "schedule_data",style: dstyle,txt: d.name,title:d.name});
          
            tmp2.appendTo(schedule_body)
                  .click(function(){
                    if(obj.settings.data_click) obj.settings.data_click(d,tmp2);
                  })
                //リサイズ
                .resizable({handles:"e,w",
                         grid:[obj.settings.width,0],
                         stop: function(event,ui){
                           //微調整
                           var adjust = Math.round(ui.size.width/obj.settings.width)*obj.settings.width;//widthの倍数
                           //var dd = datas[$(obj).data("idx")];
                           d.start_date = obj.get_day(ui.position.left);
                           d.end_date = obj.get_day(ui.position.left+adjust-1);
                           obj.settings.move(d);
                         }
                       })
                //ドラッグ＆ドロップ
                .draggable({axis: "x",
                         grid:[obj.settings.width,0],
                         stop: function( event, ui ){
                           //var dd = datas[$(this).data("idx")];
                           d.start_date = obj.get_day(ui.position.left);
                           d.end_date = obj.get_day(ui.position.left+$(this).width()-1);
                           obj.settings.move(d);
                         }
                        });
            
            if(obj.settings.data_render) obj.settings.data_render(d,tmp2);

        });
      },
    });

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;
            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });
            return returns !== undefined ? returns : this;
        }
    };

} )( jQuery, window, document );



  var holiday={
  "2016/1/01" : "元日",
   "2016/1/11" : "成人の日",
   "2016/2/11" : "建国記念の日",
   "2016/3/20" : "春分の日",
   "2016/3/21" : "振替休日",
   "2016/4/29" : "昭和の日",
   "2016/5/03" : "憲法記念日",
   "2016/5/04" : "みどりの日",
   "2016/5/05" : "こどもの日",
   "2016/7/18" : "海の日",
   "2016/8/11" : "山の日",
   "2016/9/19" : "敬老の日",
   "2016/9/22" : "秋分の日",
   "2016/10/10" : "体育の日",
   "2016/11/03" : "文化の日",
   "2016/11/23" : "勤労感謝の日",
   "2016/12/23" : "天皇誕生日",
   "2017/1/01" : "元日",
   "2017/1/02" : "振替休日",
   "2017/1/09" : "成人の日",
   "2017/2/11" : "建国記念の日",
   "2017/3/20" : "春分の日",
   "2017/4/29" : "昭和の日",
   "2017/5/03" : "憲法記念日",
   "2017/5/04" : "みどりの日",
   "2017/5/05" : "こどもの日",
   "2017/7/17" : "海の日",
   "2017/8/11" : "山の日",
   "2017/9/18" : "敬老の日",
   "2017/9/23" : "秋分の日",
   "2017/10/09" : "体育の日",
   "2017/11/03" : "文化の日",
   "2017/11/23" : "勤労感謝の日",
   "2017/12/23" : "天皇誕生日",
   "2018/1/01" : "元日",
   "2018/1/08" : "成人の日",
   "2018/2/11" : "建国記念の日",
   "2018/2/12" : "振替休日",
   "2018/3/21" : "春分の日",
   "2018/4/29" : "昭和の日",
   "2018/4/30" : "振替休日",
   "2018/5/03" : "憲法記念日",
   "2018/5/04" : "みどりの日",
   "2018/5/05" : "こどもの日",
   "2018/7/16" : "海の日",
   "2018/8/11" : "山の日",
   "2018/9/17" : "敬老の日",
   "2018/9/23" : "秋分の日",
   "2018/9/24" : "振替休日",
   "2018/10/08" : "体育の日",
   "2018/11/03" : "文化の日",
   "2018/11/23" : "勤労感謝の日",
   "2018/12/23" : "天皇誕生日",
   "2018/12/24" : "振替休日",
   "2019/1/01" : "元日",
   "2019/1/14" : "成人の日",
   "2019/2/11" : "建国記念の日",
   "2019/3/21" : "春分の日",
   "2019/4/29" : "昭和の日",
   "2019/5/03" : "憲法記念日",
   "2019/5/04" : "みどりの日",
   "2019/5/05" : "こどもの日",
   "2019/5/06" : "振替休日",
   "2019/7/15" : "海の日",
   "2019/8/11" : "山の日",
   "2019/8/12" : "振替休日",
   "2019/9/16" : "敬老の日",
   "2019/9/23" : "秋分の日",
   "2019/10/14" : "体育の日",
   "2019/11/03" : "文化の日",
   "2019/11/04" : "振替休日",
   "2019/11/23" : "勤労感謝の日",
   "2019/12/23" : "天皇誕生日",
   "2020/1/01" : "元日",
   "2020/1/13" : "成人の日",
   "2020/2/11" : "建国記念の日",
   "2020/3/20" : "春分の日",
   "2020/4/29" : "昭和の日",
   "2020/5/03" : "憲法記念日",
   "2020/5/04" : "みどりの日",
   "2020/5/05" : "こどもの日",
   "2020/7/20" : "海の日",
   "2020/8/11" : "山の日",
   "2020/9/21" : "敬老の日",
   "2020/9/22" : "秋分の日",
   "2020/10/12" : "体育の日",
   "2020/11/03" : "文化の日",
   "2020/11/23" : "勤労感謝の日",
   "2020/12/23" : "天皇誕生日",
   "2021/1/01" : "元日",
   "2021/1/11" : "成人の日",
   "2021/2/11" : "建国記念の日",
   "2021/3/20" : "春分の日",
   "2021/4/29" : "昭和の日",
   "2021/5/03" : "憲法記念日",
   "2021/5/04" : "みどりの日",
   "2021/5/05" : "こどもの日",
   "2021/7/19" : "海の日",
   "2021/8/11" : "山の日",
   "2021/9/20" : "敬老の日",
   "2021/9/23" : "秋分の日",
   "2021/10/11" : "体育の日",
   "2021/11/03" : "文化の日",
   "2021/11/23" : "勤労感謝の日",
   "2021/12/23" : "天皇誕生日",
   "2022/1/01" : "元日",
   "2022/1/10" : "成人の日",
   "2022/2/11" : "建国記念の日",
   "2022/3/21" : "春分の日",
   "2022/4/29" : "昭和の日",
   "2022/5/03" : "憲法記念日",
   "2022/5/04" : "みどりの日",
   "2022/5/05" : "こどもの日",
   "2022/7/18" : "海の日",
   "2022/8/11" : "山の日",
   "2022/9/19" : "敬老の日",
   "2022/9/23" : "秋分の日",
   "2022/10/10" : "体育の日",
   "2022/11/03" : "文化の日",
   "2022/11/23" : "勤労感謝の日",
   "2022/12/23" : "天皇誕生日",
   "2023/1/01" : "元日",
   "2023/1/02" : "振替休日",
   "2023/1/09" : "成人の日",
   "2023/2/11" : "建国記念の日",
   "2023/3/21" : "春分の日",
   "2023/4/29" : "昭和の日",
   "2023/5/03" : "憲法記念日",
   "2023/5/04" : "みどりの日",
   "2023/5/05" : "こどもの日",
   "2023/7/17" : "海の日",
   "2023/8/11" : "山の日",
   "2023/9/18" : "敬老の日",
   "2023/9/23" : "秋分の日",
   "2023/10/09" : "体育の日",
   "2023/11/03" : "文化の日",
   "2023/11/23" : "勤労感謝の日",
   "2023/12/23" : "天皇誕生日",
   "2024/1/01" : "元日",
   "2024/1/08" : "成人の日",
   "2024/2/11" : "建国記念の日",
   "2024/2/12" : "振替休日",
   "2024/3/20" : "春分の日",
   "2024/4/29" : "昭和の日",
   "2024/5/03" : "憲法記念日",
   "2024/5/04" : "みどりの日",
   "2024/5/05" : "こどもの日",
   "2024/5/06" : "振替休日",
   "2024/7/15" : "海の日",
   "2024/8/11" : "山の日",
   "2024/8/12" : "振替休日",
   "2024/9/16" : "敬老の日",
   "2024/9/22" : "秋分の日",
   "2024/9/23" : "振替休日",
   "2024/10/14" : "体育の日",
   "2024/11/03" : "文化の日",
   "2024/11/04" : "振替休日",
   "2024/11/23" : "勤労感謝の日",
   "2024/12/23" : "天皇誕生日",
   "2025/1/01" : "元日",
   "2025/1/13" : "成人の日",
   "2025/2/11" : "建国記念の日",
   "2025/3/20" : "春分の日",
   "2025/4/29" : "昭和の日",
   "2025/5/03" : "憲法記念日",
   "2025/5/05" : "こどもの日",
   "2025/5/06" : "振替休日",
   "2025/7/21" : "海の日",
   "2025/8/11" : "山の日",
   "2025/9/15" : "敬老の日",
   "2025/9/23" : "秋分の日",
   "2025/10/13" : "体育の日",
   "2025/11/03" : "文化の日",
   "2025/11/23" : "勤労感謝の日",
   "2025/11/24" : "振替休日",
   "2025/12/23" : "天皇誕生日",
   "2026/1/01" : "元日",
   "2026/1/12" : "成人の日",
   "2026/2/11" : "建国記念の日",
   "2026/3/20" : "春分の日",
   "2026/4/29" : "昭和の日",
   "2026/5/03" : "憲法記念日",
   "2026/5/04" : "みどりの日",
   "2026/5/05" : "こどもの日",
   "2026/7/20" : "海の日",
   "2026/8/11" : "山の日",
   "2026/9/21" : "敬老の日",
   "2026/9/22" : "国民の休日",
   "2026/9/23" : "秋分の日",
   "2026/10/12" : "体育の日",
   "2026/11/03" : "文化の日",
   "2026/11/23" : "勤労感謝の日",
   "2026/12/23" : "天皇誕生日",
   "2027/1/01" : "元日",
   "2027/1/11" : "成人の日",
   "2027/2/11" : "建国記念の日",
   "2027/3/21" : "春分の日",
   "2027/3/22" : "振替休日",
   "2027/4/29" : "昭和の日",
   "2027/5/03" : "憲法記念日",
   "2027/5/04" : "みどりの日",
   "2027/5/05" : "こどもの日",
   "2027/7/19" : "海の日",
   "2027/8/11" : "山の日",
   "2027/9/20" : "敬老の日",
   "2027/9/23" : "秋分の日",
   "2027/10/11" : "体育の日",
   "2027/11/03" : "文化の日",
   "2027/11/23" : "勤労感謝の日",
   "2027/12/23" : "天皇誕生日",
   "2028/1/01" : "元日",
   "2028/1/10" : "成人の日",
   "2028/2/11" : "建国記念の日",
   "2028/3/20" : "春分の日",
   "2028/4/29" : "昭和の日",
   "2028/5/03" : "憲法記念日",
   "2028/5/04" : "みどりの日",
   "2028/5/05" : "こどもの日",
   "2028/7/17" : "海の日",
   "2028/8/11" : "山の日",
   "2028/9/18" : "敬老の日",
   "2028/9/22" : "秋分の日",
   "2028/10/09" : "体育の日",
   "2028/11/03" : "文化の日",
   "2028/11/23" : "勤労感謝の日",
   "2028/12/23" : "天皇誕生日",
   "2029/1/01" : "元日",
   "2029/1/08" : "成人の日",
   "2029/2/11" : "建国記念の日",
   "2029/2/12" : "振替休日",
   "2029/3/20" : "春分の日",
   "2029/4/29" : "昭和の日",
   "2029/4/30" : "振替休日",
   "2029/5/03" : "憲法記念日",
   "2029/5/04" : "みどりの日",
   "2029/5/05" : "こどもの日",
   "2029/7/16" : "海の日",
   "2029/8/11" : "山の日",
   "2029/9/17" : "敬老の日",
   "2029/9/23" : "秋分の日",
   "2029/9/24" : "振替休日",
   "2029/10/08" : "体育の日",
   "2029/11/03" : "文化の日",
   "2029/11/23" : "勤労感謝の日",
   "2029/12/23" : "天皇誕生日",
   "2029/12/24" : "振替休日",
   "2030/1/01" : "元日",
   "2030/1/14" : "成人の日",
   "2030/2/11" : "建国記念の日",
   "2030/3/20" : "春分の日",
   "2030/4/29" : "昭和の日",
   "2030/5/03" : "憲法記念日",
   "2030/5/04" : "みどりの日",
   "2030/5/05" : "こどもの日",
   "2030/5/06" : "振替休日",
   "2030/7/15" : "海の日",
   "2030/8/11" : "山の日",
   "2030/8/12" : "振替休日",
   "2030/9/16" : "敬老の日",
   "2030/9/23" : "秋分の日",
   "2030/10/14" : "体育の日",
   "2030/11/03" : "文化の日",
   "2030/11/04" : "振替休日",
   "2030/11/23" : "勤労感謝の日",
   "2030/12/23" : "天皇誕生日",
   "2031/1/01" : "元日",
   "2031/1/13" : "成人の日",
   "2031/2/11" : "建国記念の日",
   "2031/3/21" : "春分の日",
   "2031/4/29" : "昭和の日",
   "2031/5/03" : "憲法記念日",
   "2031/5/05" : "こどもの日",
   "2031/5/06" : "振替休日",
   "2031/7/21" : "海の日",
   "2031/8/11" : "山の日",
   "2031/9/15" : "敬老の日",
   "2031/9/23" : "秋分の日",
   "2031/10/13" : "体育の日",
   "2031/11/03" : "文化の日",
   "2031/11/23" : "勤労感謝の日",
   "2031/11/24" : "振替休日",
   "2031/12/23" : "天皇誕生日",
   "2032/1/01" : "元日",
   "2032/1/12" : "成人の日",
   "2032/2/11" : "建国記念の日",
   "2032/3/20" : "春分の日",
   "2032/4/29" : "昭和の日",
   "2032/5/03" : "憲法記念日",
   "2032/5/04" : "みどりの日",
   "2032/5/05" : "こどもの日",
   "2032/7/19" : "海の日",
   "2032/8/11" : "山の日",
   "2032/9/20" : "敬老の日",
   "2032/9/21" : "国民の休日",
   "2032/9/22" : "秋分の日",
   "2032/10/11" : "体育の日",
   "2032/11/03" : "文化の日",
   "2032/11/23" : "勤労感謝の日",
   "2032/12/23" : "天皇誕生日",
   "2033/1/01" : "元日",
   "2033/1/10" : "成人の日",
   "2033/2/11" : "建国記念の日",
   "2033/3/20" : "春分の日",
   "2033/3/21" : "振替休日",
   "2033/4/29" : "昭和の日",
   "2033/5/03" : "憲法記念日",
   "2033/5/04" : "みどりの日",
   "2033/5/05" : "こどもの日",
   "2033/7/18" : "海の日",
   "2033/8/11" : "山の日",
   "2033/9/19" : "敬老の日",
   "2033/9/23" : "秋分の日",
   "2033/10/10" : "体育の日",
   "2033/11/03" : "文化の日",
   "2033/11/23" : "勤労感謝の日",
   "2033/12/23" : "天皇誕生日",
   "2034/1/01" : "元日",
   "2034/1/02" : "振替休日",
   "2034/1/09" : "成人の日",
   "2034/2/11" : "建国記念の日",
   "2034/3/20" : "春分の日",
   "2034/4/29" : "昭和の日",
   "2034/5/03" : "憲法記念日",
   "2034/5/04" : "みどりの日",
   "2034/5/05" : "こどもの日",
   "2034/7/17" : "海の日",
   "2034/8/11" : "山の日",
   "2034/9/18" : "敬老の日",
   "2034/9/23" : "秋分の日",
   "2034/10/09" : "体育の日",
   "2034/11/03" : "文化の日",
   "2034/11/23" : "勤労感謝の日",
   "2034/12/23" : "天皇誕生日",
   "2035/1/01" : "元日",
   "2035/1/08" : "成人の日",
   "2035/2/11" : "建国記念の日",
   "2035/2/12" : "振替休日",
   "2035/3/21" : "春分の日",
   "2035/4/29" : "昭和の日",
   "2035/4/30" : "振替休日",
   "2035/5/03" : "憲法記念日",
   "2035/5/04" : "みどりの日",
   "2035/5/05" : "こどもの日",
   "2035/7/16" : "海の日",
   "2035/8/11" : "山の日",
   "2035/9/17" : "敬老の日",
   "2035/9/23" : "秋分の日",
   "2035/9/24" : "振替休日",
   "2035/10/08" : "体育の日",
   "2035/11/03" : "文化の日",
   "2035/11/23" : "勤労感謝の日",
   "2035/12/23" : "天皇誕生日",
   "2035/12/24" : "振替休日",
};
