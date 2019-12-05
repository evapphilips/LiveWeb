
function blah(){
// variables
//var usersForTackers;
var users;

var socket;

function socketStuffs() {
// connect to socket
socket = io.connect("https://ep1521.itp.io:8092/");

socket.on('connect', function () {
    console.log("Connected");
});

//when a new user is connected
socket.on('sharingNewUser', function (data) {
    // get the new user ID
    var newUserId = data;

    console.log("hi")
    // create a new div for the new user
    var tracker = document.createElement('P');
    // tracker.className = "aMouse";
    tracker.style.position = "absolute";
    tracker.style.width = "2vh";
    tracker.style.height = "2vh";
    tracker.style.borderRadius = "500px";
    tracker.style.backgroundColor = "black";
    tracker.id = newUserId;
    tracker.innerHTML = "   ";
    document.body.appendChild(tracker);

})

// when a you connect, get points form already connected users
socket.on('shareExistingUsers', function (data) {
    users = data;
    console.log(users);

    for (let user of users) {
        // console.log(user);

        // create a new div for the new user
        var tracker = document.createElement('P');
        tracker.className = "aMouse";
        tracker.id = user.id;
        tracker.innerHTML = "   ";
        // if(user.mousePos.p){
        //     tracker.style.top = user.mousePos.y;
        // }
        document.body.appendChild(tracker);
    }
})

// when a user disconnects, remove that div from the page
socket.on('removeUserDiv', function (data) {
    console.log("removing")
    var toRemoveId = data;
    var toRemove = document.getElementById(toRemoveId);
    document.body.removeChild(toRemove);
})

// recieve updated user positions from server
socket.on('sharingMousePos', function (data) {
    //console.log(data);
    // assign data to users
    users = data

    // when you recieve users, loop through and draw them to the screen
    for (let user of users) {
        //console.log(user.pos);
        var tracker = document.getElementById(user.id);
        tracker.style.top = user.pos.y;
        tracker.style.left = user.pos.x;

        // check if overlapping
        for (let otherUser of users) {
            if (user.id !== otherUser.id &&
                user.pos.x >= (otherUser.pos.x - 100) &&
                user.pos.x < (otherUser.pos.x + 100) &&
                user.pos.y >= (otherUser.pos.y - 100) &&
                user.pos.y < (otherUser.pos.y + 100)) {
                tracker.style.visibility = "visible"
                tracker.style.backgroundColor = 'red';
            }
        }
    }
})
}

// when page loads
//window.addEventListener('load', init);
function init() {
    console.log("init")

    socketStuffs();

    // when mouse moves
    document.addEventListener('mousemove', sendPos);
    function sendPos(e) {
        // store psotion of my mouse
        var mousePos = {
            x: e.clientX,
            y: e.clientY
        }
        socket.emit('sendingMousePos', mousePos);
    }
}

init();

}

blah();
