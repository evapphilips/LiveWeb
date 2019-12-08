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
httpServer.listen(8096);


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

        // console.log(users);
        // if this is the first user, make them IT
        if(users.length == 0){
            users.push({id: socket.id, pos: {x: -1, y: -1}, it: true});
        }else{ // otherwise make the not IT
            users.push({id: socket.id, pos: {x: -1, y: -1}, it: false});
        }
        // console.log(users);

        // When a client connects, share their id with everyone
        if(users.length == 0){
        socket.broadcast.emit('sharingNewUser', {id: socket.id, pos: {x: Math.random(-255, 0), y: Math.random(-255, 0)}, it: true});  // to everyone else
        }else{
            socket.broadcast.emit('sharingNewUser', {id: socket.id, pos: {x: Math.random(-255, 0), y: Math.random(-255, 0)}, it: false});  // to everyone else
        }
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

        // When a Tag occurs
        socket.on('tagOccured', function(data){
            //console.log("Tag occured " + data.newIt + " " + data.oldIt);

            // updated old IT
            var oldIndex = users.findIndex(item => item.id === data.oldIt);
            users[oldIndex].it = false;

            // update new It
            var newIndex = users.findIndex(item => item.id === data.newIt);
            users[newIndex].it = true;

            // share these updated IT values with everyone
            socket.broadcast.emit('sharingUpdatedItValues', data)// to everyone
        })
		
		socket.on('disconnect', function() {
            console.log("Client has disconnected " + socket.id);

            // When a client disconnects, remove them from the users array
            var index = users.findIndex(item => item.id === socket.id);

            // Check is the cient that is being removed is IT
            console.log(users[index])
            if(users[index].it === true){  // if the person who was IT, leaves, make a random person IT
                // remove the proper users
                users.splice(index, 1);
                // then make someone else it
                if(users.length !== 0){
                    users[0].it = true;
                
                    // Make a new user IT on the client side
                    socket.broadcast.emit('newITUser', users[0].id); // to everyone else

                    // When a client disconnects, send a message to the exisiting clients to remove that user
                    console.log("sending id to remove")
                    socket.broadcast.emit('removeAUser', socket.id); // to everyone else
                }

                

            }else{
                // otherwise just remove the user
                users.splice(index, 1);

                // When a client disconnects, send a message to the exisiting clients to remove that user
                console.log("sending id to remove")
                socket.broadcast.emit('removeAUser', socket.id); // to everyone else
            } 
            console.log(users);

            

            
		});
	}
);