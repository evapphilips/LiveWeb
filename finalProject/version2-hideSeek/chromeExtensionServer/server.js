// variables
var users = [];

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
httpServer.listen(8094);


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

        // When a client connects, add them to the users array
        console.log("We have a new client: " + socket.id);
        users.push({id: socket.id});
        //console.log(users);

        // When a client connects, share their id with everyone
        socket.broadcast.emit('sharingNewUser', {id: socket.id});  // to everyone else
        //socket.emit('sharingNewUser', {id: socket.id});  // to self

        // When a client connects, give them everyone elses id
        socket.emit('sharingExistingUsers', users); // to self

        // When a client sends their mouse position, store it
        socket.on('sendingMousePos', function(data){
            // add that position to the users object
            var index = users.findIndex(item => item.id === socket.id);
            users[index].pos = data;

            // send that users updated position to everyone
            socket.broadcast.emit('sharingAnUpdatedPos', users[index]); // to everyone
            
            // send that users upsed position to themself
            socket.emit('sharingAnUpdatedPosToSelf', users[index]); // to self
            
        })

    



		// // when a clients mouse position is recieved, store it
		// socket.on('sendingMousePos', function(data){
		// 	// add position to users
		// 	users[users.findIndex(item => item.id === socket.id)].pos = data;
			
		// 	// send updated users to everyone
		// 	socket.emit('sharingMousePos', users);
		// })
		
		socket.on('disconnect', function() {
            console.log("Client has disconnected " + socket.id);

            // When a client disconnects, remove them from the users array
            var index = users.findIndex(item => item.id === socket.id);
            users.splice(index, 1);
            console.log(users);

            // When a client disconnects, send a message to the exisiting clients to remove that user
            console.log("sending id to remove")
            socket.broadcast.emit('removeAUser', socket.id); // to everyone else
		});
	}
);