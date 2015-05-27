var rfb = require('rfb2'),
  port = 8090,
  socketIoPort = 8091,
  socketio = require('socket.io').listen(socketIoPort, { log: false }),
 // Png = require('./node_modules/node-png/build/Release/png').Png,
  //Png = require('./node_modules/node-jpeg/build/Release/jpeg').DynamicJpegStack,
  Png = require('./node_modules/node-jpeg/build/Release/jpeg').Jpeg,
  connect = require('connect'),
  sharp = require('sharp'),
  util = require('util'),
  clients = [];

function createRfbConnection(config, socket) {
  var r = rfb.createConnection({
    host: config.host,
    port: config.port,
    password: config.password
  });
  addEventHandlers(r, socket);
  return r;
}

var startingWidth = 0;
var startingHeight = 0;

function addEventHandlers(r, socket) {
  r.on('connect', function () {
    console.log("Connected to RFB");
    socket.emit('init', {
      width: r.width,
      height: r.height
    });
    clients.push({
      socket: socket,
      rfb: r
    });
  });

  r.on('rect', function (rect) {
    //r.requestUpdate(true, 0, 0, r.width, r.height);
    handleFrame(socket, rect, r);
    r.requestUpdate(true, 0, 0, r.width, r.height);
  });
  r.on("Frame", function(frame) {
	console.log("Testing works");
  });

  r.on("end", function(close) {
  	console.log("RFB CLOSED");
  	console.log(close);
	socket.emit('close', close);
  });

  r.on("error", function(error) {
	console.log("RFB ERROR");
	console.log(error);
	socket.emit('error', {error: error});
	r.end();
  });

  r.on('bell' console.log.bind(null, 'Bell!!'));

}

//var image = new Png('rgb');

function handleFrame(socket, rect, r) {
 // socket.emit('rect', rect);

 //console.log("handling frame", rect);
 if(rect.encoding == 0){
   var rgb = new Buffer(rect.width * rect.height * 3, 'binary'),
    offset = 0;

  for (var i = 0; i < rect.data.length; i += 4) {
    rgb[offset++] = rect.data[i + 2];
    rgb[offset++] = rect.data[i + 1];
    rgb[offset++] = rect.data[i];
  }
  
  //if(r.width == rect.width && r.height == rect.height) {
  	var image = new Png(rgb, rect.width, rect.height, 'rgb');
  //} else {
//	image = 
   //	image.setBackground(rgb, r.width, r.height);
  //}
  //image.push(rgb, rect.x, rect.y, rect.width, rect.height);

  image.encode(function(png, dms){
  //console.log("Emmitting frame");
        //console.log(util.inspect(sharp(png)));
  	socket.emit('frame', {
  	  x: rect.x,
    	  y: rect.y,
   	  width: rect.width,
   	  height: rect.height,
          image: png.toString('base64')
    //      rgb: rgb
  	});
	//r.requestUpdate(true, 0, 0, r.width, r.height);
  });
  }
}

function disconnectClient(socket) {
  clients.forEach(function (pair) {
    if (pair.socket === socket) {
      pair.rfb.end();
      console.log("RFB Ended");
    }
  });
  clients = clients.filter(function (pair) {
    return pair.socket === socket;
  });
}

connect.createServer(connect.static('./static')).listen(port);

socketio.sockets.on('connection', function (socket) {
  socket.on('init', function (config) {
    var r = createRfbConnection(config, socket);
    socket.on('mouse', function (evnt) {
 //     console.log(evnt.x);
      r.pointerEvent(evnt.x, evnt.y, evnt.button);
    });
    socket.on('keyboard', function (evnt) {
      r.keyEvent(evnt.keyCode, evnt.isDown);
    });
    socket.on('disconnect', function () {
      disconnectClient(socket);
    });
  });
});

console.log('Listening on port', port);
console.log('SocketIO listening on port', socketIoPort);
