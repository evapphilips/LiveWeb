// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('buttonState', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'buttonState' " + data.state);
			
			// Send it to all of the clients
			socket.broadcast.emit('buttonState', data);
        });
        socket.on('buttonState1', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'buttonState1' " + data.state);
			
			// Send it to all of the clients
            socket.broadcast.emit('buttonState1', data);
		});
		socket.on('buttonState2', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'buttonState2' " + data.state);
			
			// Send it to all of the clients
            socket.broadcast.emit('buttonState2', data);
        });
        socket.on('buttonState3', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'buttonState3' " + data.state);
			
			// Send it to all of the clients
            socket.broadcast.emit('buttonState3', data);
		});

		socket.on('groupState', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'groupState' " + data.groupState);
			
			// Send it to all of the clients
            socket.broadcast.emit('groupState', data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
	