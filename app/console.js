const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const path = require("path");
const fs = require('fs');
const iconv = require('iconv-lite');
const Convert = require('ansi-to-html');
const convert = new Convert();
const windows = require('os').type().toString().match('Windows') !== null;
const escapeChar = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
  '\\': '&#92;'
};

const Console = (socket) => {


  socket.on('connection', (client) => {



        function escapeHtml (src) {
          return src.replace(/[&<>"'`=\/]/g, function (s) {
            return escapeChar[s];
          });
        }

        function convertData(data){
          if(windows){
              return convert.toHtml(escapeHtml(iconv.decode(data, "Shift_JIS"))
                                    .replace(/]9;8;&quot;USERNAME&quot;../g,"admin")
                                    .replace(/]9;8;&quot;COMPUTERNAME&quot;../g,"win")
                                    );
          }else{
              return convert.toHtml(escapeHtml(data.toString())
                             .replace(/\u001b\]0;.*?\u0007/,"")
                             .replace(/\u001b\[\?\d+h/g,"")
                             );
          }
        }

      var shell = null;
      //consoleの起動
      function createShell(){
        kill_process();
        shell = spawn(windows ? "cmd.exe" : "script", [], {cdw:''} , {detached: true});
        //child.unref();
        shell.stdout.on('data', (data) => {
             client.emit('data',convertData(data));
        });

        shell.stderr.on('data', (data) => {
          client.emit('data',convertData(data));
        });

        shell.on('close', (code,signal) => {
          client.emit('data',`終了：CODE=${code}\n`);
        });

        shell.on('error', (err) => {
          client.emit('data',`エラー：${err}\n`);
          kill_process();
        });
      }

      function kill_process(){
        if(!shell) return;
        try{
          const pid = shell.pid;
          if(windows){
            exec('taskkill /pid ' + pid + ' /T /F');
          }else{
            //exec("kill `ps ho pid --ppid "+pid+"`");
            exec("kill -KILL "+pid+" `ps --ppid="+pid+" | awk '{ print $1 }'`");
          }
        }catch(e){console.log(e)}

        shell=null;
      }
      //初期の起動
      createShell();

      client.on('input', (data) => {
          try{
              if(!windows) client.emit('data',`${convertData(data)}\n`);
              shell.stdin.write(`${data}\n`);
          }catch(e){
              createShell();
          }
      });

      //Ctrl+C
      client.on('break', (data) => {
        kill_process();
        createShell();
      });

      client.on('error', (e) => {
        kill_process();
      });

      //接続終了
      client.on('disconnect', () => {
        kill_process();
      });

  });
}

module.exports = Console;
