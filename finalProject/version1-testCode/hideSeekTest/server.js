// // HTTP Portion
// var http = require('http');
// var fs = require('fs'); // Using the filesystem module
// var httpServer = http.createServer(requestHandler);
// var url = require('url');
// httpServer.listen(8092);

var users = [];

// function requestHandler(req, res) {

// 	var parsedUrl = url.parse(req.url);
// 	console.log("The Request is: " + parsedUrl.pathname);
		
// 	fs.readFile(__dirname + parsedUrl.pathname, 
// 		// Callback function for reading
// 		function (err, data) {
// 			// if there is an error
// 			if (err) {
// 				res.writeHead(500);
// 				return res.end('Error loading ' + parsedUrl.pathname);
// 			}
// 			// Otherwise, send the data, the contents of the file
// 			res.writeHead(200);
// 			res.end(data);
//   		}
//   	);
// }

// HTTPS Portion
var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url =  require('url');

var options = {
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

function handleIt(req, res) {
	var parsedUrl = url.parse(req.url);

	var path = parsedUrl.pathname;
	if (path == "/") {
		path = "index.html";
	}

	fs.readFile(__dirname + path,

		// Callback function for reading
		function (err, fileContents) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + req.url);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(fileContents);
  		}
  	);	
	
	// Send a log message to the console
	console.log("Got a request " + req.url);
}

var httpServer = https.createServer(options, handleIt);
httpServer.listen(8092);




// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		// When a client is connected, add to users object
        console.log("We have a new client: " + socket.id);
		users.push({id: socket.id});
		// send new user to clients
		socket.broadcast.emit('sharingNewUser', socket.id);
		socket.emit('shareExistingUsers', users);

		// when a clients mouse position is recieved, store it
		socket.on('sendingMousePos', function(data){
			// add position to users
			users[users.findIndex(item => item.id === socket.id)].pos = data;
			
			// send updated users to everyone
			socket.emit('sharingMousePos', users);
		})
		

		
		// // When this user emits, client side: socket.emit('otherevent',some data);
		// socket.on('chatmessage', function(data) {
		// 	// Data comes in as whatever was sent, including objects
		// 	console.log("Received: 'chatmessage' " + data);
			
		// 	// Send it to all of the clients
		// 	socket.broadcast.emit('chatmessage', data);
		// });
		
		
		socket.on('disconnect', function() {
            console.log("Client has disconnected " + socket.id);

            // When a client diconnects, remove them from the users array
            var index = users.findIndex(item => item.id === socket.id);
			users.splice(index, 1);
			
			// send message to remove that users div
			console.log("sending id to remove")
			socket.broadcast.emit('removeUserDiv', socket.id);
		});
	}
);
		