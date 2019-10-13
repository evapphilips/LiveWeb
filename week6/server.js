// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8086);

function requestHandler(req, res) {
	var parsedUrl = url.parse(req.url);
	//console.log("The Request is: " + parsedUrl.pathname);	
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
        // When a new client joins
        console.log("We have a new client: " + socket.id);
		// // When this user emits, client side: socket.emit('otherevent',some data);
		// socket.on('chatmessage', function(data) {
		// 	// Data comes in as whatever was sent, including objects
		// 	console.log("Received: 'chatmessage' " + data);
			
		// 	// Send it to all of the clients
		// 	socket.broadcast.emit('chatmessage', data);
        // });
        
        // // When a user emits their mouse position
        // socket.on('coordinates', function(data){
        //     //console.log("Socket recieved mouse position: " + data.x + ", " + data.y);
        //     // send the mouse position to all of the clients
        //     socket.broadcast.emit('coordinates', data);
        // })

        // When a user emits a button state
        socket.on('buttonState', function(data){
            //console.log("socket recieved: " + data);
            // send the button state to all the clients
            socket.broadcast.emit('buttonState', data);
        })

        // When a user clicks the next button
        socket.on('nextLevel', function(data){
            // send the level to all the clients
            socket.broadcast.emit('nextLevel', data);
        })

        // When a user clicks the restart button
        socket.on('toBeginning', function(data){
            // send the beginning state to all the clients
            socket.broadcast.emit('toBeginning', data);
        })

        // When a user mouses over the extra button
        socket.on('extraState', function(data){
            // send the extra state to all the clients
            socket.broadcast.emit('extraState', data);
        })
		
		// When a client disconnects
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);