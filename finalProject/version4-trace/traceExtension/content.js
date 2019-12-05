// check that the content is running
console.log("content is running");

// when page loads
window.addEventListener('load', init);
function init() {

    // variables
    var socket;
    var currentUsers = [];

    // connect to socket
    socket = io.connect("https://ep1521.itp.io:8095/");
    socket.on('connect', function () {
        console.log("Connected");

        // create a canvas to cover the whole page
        var cvs = document.createElement('canvas')
        cvs.id = "myCanvas";
        cvs.style.position = "absolute";
        cvs.style.top = "0px";
        cvs.style.left = "0px";
        //cvs.style.backgroundColor = "red";
        cvs.width = window.innerWidth;
        cvs.height = document.body.scrollHeight;
        //cvs.style.height = "100%";
        //cvs.style.height = window.innerHeight;
        document.body.appendChild(cvs);

    });

    // when you connect, recieve exisiting user id and add to the currentUsers array
    socket.on('sharingExistingUsers', function (data) {
        console.log("getting exisiting users")
        // update currentUsers array
        currentUsers = data;
        console.log(currentUsers)

        // create a tracker div for each user
        // currentUsers.forEach(user => {
        //     createTracker(user.id);
        // });   
    })

    // When you recieve a click from another user
    socket.on('sharingClicked', function(data){
        //console.log(data + " clicked");
        var index = currentUsers.findIndex(item => item.id === data);
        //console.log(currentUsers[index]);

        // draw a dot for the click
        // access the canvas
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, .4)';
        context.beginPath();
        context.ellipse(currentUsers[index].pos.x, currentUsers[index].pos.y, 20, 20,  Math.PI/4, 0, 2*Math.PI, true);
        context.fill();

    })

    // when you recieve a new user id, update the currentUsers array
    socket.on('sharingNewUser', function (data) {
        // update currentUsers array
        currentUsers.push(data);
        console.log(currentUsers);

        // create a tracker div for the new user
        //createTracker(data.id);
    })

    // when a user discconects, remove them from the currentUsers array
    socket.on('removeAUser', function (data) {
        // update and remove currentUsers array
        var index = currentUsers.findIndex(item => item.id === data);
        currentUsers.splice(index, 1);
        //console.log(currentUsers);

        // remove tracker div for user who left
        //removeTracker(data)
    })

    function createTracker(id) {
        var tracker = document.createElement('Div')
        tracker.id = id;
        tracker.style.position = "absolute";
        tracker.style.width = "3vh";
        tracker.style.height = "3vh";
        tracker.style.borderRadius = "500px";
        tracker.style.backgroundColor = "black";
        //tracker.style.backgroundImage = "url('cursorReg.png')"
        tracker.innerHTML = "  "
        document.body.appendChild(tracker);
    }

    function removeTracker(id) {
        var tracker = document.getElementById(id);
        document.body.removeChild(tracker);

    }

    // When this client moves, send their position to the server
    document.addEventListener('mousemove', (e) => {
        // store mouse position
        var mousePos = {
            x: e.pageX,
            y: e.pageY
        }

        // send to server
        socket.emit('sendingMousePos', mousePos);
    });

    // when a client clicks
    document.addEventListener('click', () => {
        console.log('i clicked')
        // send a message to the server that i clicked
        socket.emit('userClicked', true);
    })

    // When you recieve an updated position from a user, update their div position
    socket.on('sharingAnUpdatedPos', function(data){
        //console.log(data);
        // update tracker positon and check if they are overlapping with another
        updateTracker(data, 0);
    })

    // When you recieve an updated position from a user, update their div position
    socket.on('sharingAnUpdatedPosToSelf', function(data){
        //console.log(data);
        // update tracker positon and check if they are overlapping with another
        updateTracker(data, 1);
    })

    function updateTracker(thisUser, type){
        // access the apporopriate tracker
        //var tracker = document.getElementById(thisUser.id);
        // move the appropriate tracker

        var index = currentUsers.findIndex(u => u.id === thisUser.id);
        currentUsers[index].pos = thisUser.pos;


        // if(thisUser.pos != "undefined"){
        //     tracker.style.top = thisUser.pos.y + "px";
        //     tracker.style.left = thisUser.pos.x + "px";
        // }
        

        // check if two users are overlapping
        if(type == 0){
            currentUsers.forEach(user => {
                if(user.pos != "undefined" && thisUser.pos != "undefined"){
                    if(user.id !== socket.id &&
                        user.pos.x >= (thisUser.pos.x - 10) && 
                        user.pos.x < (thisUser.pos.x + 10) &&
                        user.pos.y >= (thisUser.pos.y - 10) &&
                        user.pos.y < (thisUser.pos.y + 10)){
    
                        //console.log(thisUser.id ,user.id, "red!");
                        // change this tracker to red
                        // tracker.style.visibility = "visible";
                        // tracker.style.backgroundColor = 'red';
    
                        // change other tracker to visible
                        //var otherTracker = document.getElementById(user.id);
                        //otherTracker.style.visibility = "visible";
                        //otherTracker.style.backgroundColor = 'red';

                        // access the canvas
                        var canvas = document.getElementById('myCanvas');
                        // canvas.height = document.body.scrollHeight
                        //console.log(document.body.scrollHeight)
                        //canvas.style.backgroundColor = 'red';
                        var context = canvas.getContext('2d');
                        //context.fillStyle="#00000";
                        //context.fillRect(user.pos.x, convertRange(user.pos.y, [0, document.body.scrollHeight], [0, window.innerHeight]), 1, 1);
                        //context.fillRect(user.pos.x, user.pos.y, 2, 2);
                        context.fillStyle = 'rgba(0, 0, 0, .2';
                        context.beginPath();
                        context.ellipse(user.pos.x, user.pos.y, 10, 5,  Math.PI/4, 0, Math.PI, true);
                        context.fill();

                        //console.log(window.innerHeight);
                        // function convertRange( value, r1, r2 ) { 
                        //     return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
                        // }
        
                    }
                }
                
            })
        }
        
    }

}