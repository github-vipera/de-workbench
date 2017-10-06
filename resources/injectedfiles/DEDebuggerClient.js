console.info("DEDebuggerClient injected");

/**
* Init web socket for bidirectional communication
*/
function initPlatformDebugSocket(address){
  console.log("initPlatformDebugSocket: " + address);
  var __deDebuggerSocket = io(address);

  if(typeof window != "undefined"){
    window.deDebuggerSocket =__deDebuggerSocket;
  }else{
    console.warn("window is undefined");
  }

  var sendResultToDebugger=function(result,request){
    window.deDebuggerSocket.emit('evalResult',{
      'status':'OK',
      'evalRes':result,
      'id': request.id
    });
  };

  var sendErrorToDebugger=function(err,request){
    window.deDebuggerSocket.emit('evalResult',{
      'status':'ERROR',
      'err': {message: err.message, stack: err.stack },
      'id': request.id
    });
  }

  __deDebuggerSocket.on('connection', function(socket) {
      console.log('a user connected');
  });

  __deDebuggerSocket.on('doEval', function(message) {
      console.log('doEval called');
      var scriptSrc= message.cmd;
      try {
        var res = eval(scriptSrc);
        sendResultToDebugger(res,message);
      } catch (e) {
        sendErrorToDebugger(e,message);
      }
      console.log('doEval done');
  });
  __deDebuggerSocket.on('doLiveReload', function() {
      console.log('doLiveReload called');
      window.location.reload();
      console.log('doLiveReload done');
  });
};


document.addEventListener("deviceready",function(){
  console.info("DEDebuggerClient init");
  var available = typeof(DynamicEngine) != "undefined" && DynamicEngine.plugins &&  DynamicEngine.plugins.DEDebugger;
  if(available){
    DynamicEngine.plugins.DEDebugger.getServerAddress(function(address){
      console.log("Remove server address for debugger:" + address);
      initPlatformDebugSocket(address);
    },function(err){
      console.error("Unexpected error:",err);
    });
  }else{
    console.error("DynamicEngine.plugins.DEDebugger not found");
  }
},false);
