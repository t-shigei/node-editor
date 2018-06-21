const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const windows = require('os').type().toString().match('Windows') !== null;

const Grep = (socket) => {


  socket.on('connection', (client) => {

      client.on('search', (data) => {
          //cmd injection出来ちゃうけど無視
        var dirs = data.directory.split(" ").reduce((ret,d)=>{ 
                                                              ret += (d==='' ? '' : ' -path "./'+d+'" -prune -o ');
                                                              return ret; 
                                                            },"");
        var cmd = 'find . '+dirs+' -type f -name "'+data.filter+'" | xargs grep -E -n '+data.token+' 2>/dev/null';
        client.emit('data',cmd+"\n");
        client.shell = spawn("bash",["-c",cmd], {cwd:data.path} , {detached: true});
        client.emit('data',client.shell.pid+"\n");
        //client.emit('data',"script -c "+cmd+"\n");
        //child.unref();
        client.shell.stdout.on('data', (data) => {
             client.emit('data',data.toString());
        });

        client.shell.stderr.on('data', (data) => {
          client.emit('data',data.toString());
        });

        client.shell.on('close', (code,signal) => {
          client.emit('end',`終了：CODE=${code}\n`);
        });

        client.shell.on('error', (err) => {
          client.emit('end',`エラー：${err}\n`);
        });
      });
      
      client.on('break', (e) => {
          if(client.shell){
              exec("kill -KILL "+client.shell.pid+" `ps --ppid="+client.shell.pid+" | awk '{ print $1 }'`");
          }
      });

      client.on('error', (e) => {
      });

      //接続終了
      client.on('disconnect', () => {
      });

  });
}

module.exports = Grep;
