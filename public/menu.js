
//TopManu Plugin
//
;(function( $, window, document, undefined ) {

    "use strict";
    var pluginName = "TopMenu";
    var defaults = {
            items: [],
            bindCreate:[]
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
        $(this.element).append("<li>"+this.settings.title+"</li>"); 
        for(var i=0;i<this.settings.items.length;i++){
            this.add(this.settings.items[i]);
        }
        $(this.element).kendoMenu();
      },
      add: function(item){
        var menu =$("<li><a href='#'>"+item.text+"</a></li>");
        if(item.list){
            var ul = $("<ul></ul>").appendTo(menu);
            $.each(item.list,function(i,sub){
                $("<li><a href='#'>"+sub+"</a></li>")
                    .appendTo(ul)
                    .click(function(){
                        if(item.click) item.click(sub);
                        return false;
                    });
            });
        }else{
            menu.click(function(){
                        if(item.click) item.click(item);
                        return false;
                    });
        }
        $(this.element).append(menu);
      },
      reload: function(){
          $(this.element).data("kendoMenu").destroy();
          $(this.element).html("");
          this.init();
      }
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