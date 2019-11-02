// Database to store data
var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8089);

function requestHandler(req, res) {
	// Read index.html
	fs.readFile(__dirname + '/index.html', 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
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
        
        // when a new item is recieved
        socket.on('addListItem', function(listItem){
            //console.log(listItem)
            // add the list item to the database
            // create a javascript object for the list idem
			var newListItem = {
				socketid: socket.id,
				item: listItem,
				completed: false
			}
            // insert the new list item into the database
			db.insert(newListItem, function (err, newDocs) {
				//console.log("err: " + err);
				//console.log("newDocs: " + newDocs);
			});
			// send the new list item to everyone 
			socket.emit('updateListItem', newListItem);
            socket.broadcast.emit('updateListItem', newListItem);
		})

		// when an updated state is recieved
		socket.on('updateItemState', function(item){
			db.find({}, function(err, docs){
				// remove all the exisiting items
				socket.emit('removeExistingItems', docs);
				socket.broadcast.emit('removeExistingItems', docs);
				// update new items and add them to the list
				for (var i = 0; i < docs.length; i++) {
					if(docs[i].item == item){
						// change the state of that item in the db
						db.update({ item: docs[i].item }, { $set: { completed: true }}, function(err, stateReplaced){})
						//docs[i].completed = true;
					}
					socket.emit('updateListItem', docs[i]);
					socket.broadcast.emit('updateListItem', docs[i]);
				}
				
			})
			// db.find({}, function(err, docs){
			// 	// Loop through the results, send each one as if it were a new chat message
			// 	for (var i = 0; i < docs.length; i++) {
			// 		console.log(docs[i])
					
			// 	}
			// })
		})
		
		// When the history is requested, find all of the docs in the database
		socket.on('history', function() {
			db.find({}, function(err, docs) {
				// Loop through the results, send each one as if it were a new chat message
				for (var i = 0; i < docs.length; i++) {
					//console.log(docs[i])
					socket.emit('updateListItem', docs[i]);
				}
			})
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);