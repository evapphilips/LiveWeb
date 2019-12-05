// check that the content is running
console.log("content is running");

// when page loads
window.addEventListener('load', init);
function init() {

    // variables
    var socket;
    var currentUsers = [];

    // connect to socket
    socket = io.connect("https://ep1521.itp.io:8094/");
    socket.on('connect', function () {
        console.log("Connected");
    });

    // when you connect, recieve exisiting user id and add to the currentUsers array
    socket.on('sharingExistingUsers', function (data) {
        console.log("getting exisiting users")
        // update currentUsers array
        currentUsers = data;
        //console.log(currentUsers)

        // create a tracker div for each user
        currentUsers.forEach(user => {
            createTracker(user.id);
        });
    })

    // when you recieve a new user id, update the currentUsers array
    socket.on('sharingNewUser', function (data) {
        // update currentUsers array
        currentUsers.push(data);
        console.log(currentUsers);

        // create a tracker div for the new user
        createTracker(data.id);
    })

    // when a user discconects, remove them from the currentUsers array
    socket.on('removeAUser', function (data) {
        // update and remove currentUsers array
        var index = currentUsers.findIndex(item => item.id === data);
        currentUsers.splice(index, 1);
        //console.log(currentUsers);

        // remove tracker div for user who left
        removeTracker(data)
    })

    function createTracker(id) {
        var tracker = document.createElement('Div')
        tracker.id = id;
        tracker.style.position = "absolute";
        tracker.style.width = "3vh";
        tracker.style.height = "3vh";
        tracker.style.borderRadius = "500px";
        tracker.style.backgroundColor = "black";
        tracker.style.visibility = "hidden"
        //tracker.style.backgroundImage = "url('https://ep1521.itp.io:8084/cursorReg.png')"
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
        var tracker = document.getElementById(thisUser.id);
        // move the appropriate tracker

        var index = currentUsers.findIndex(u => u.id === thisUser.id);
        currentUsers[index].pos = thisUser.pos;


        if(thisUser.pos != "undefined"){
            tracker.style.top = thisUser.pos.y + "px";
            tracker.style.left = thisUser.pos.x + "px";
        }
        

        // check if two users are overlapping
        if(type == 1){
            currentUsers.forEach(user => {
                if(user.pos != "undefined" && thisUser.pos != "undefined"){
                    if(user.id !== socket.id &&
                        user.pos.x >= (thisUser.pos.x - 10) && 
                        user.pos.x < (thisUser.pos.x + 10) &&
                        user.pos.y >= (thisUser.pos.y - 10) &&
                        user.pos.y < (thisUser.pos.y + 10)){
    
                        console.log(thisUser.id ,user.id, "red!");
                        // change this tracker to red
                        // tracker.style.visibility = "visible";
                        // tracker.style.backgroundColor = 'red';
    
                        // change other tracker to visible
                        var otherTracker = document.getElementById(user.id);
                        otherTracker.style.visibility = "visible";
                        //otherTracker.style.backgroundColor = 'red';
        
                    }
                }
                
            })
        }
        
    }

}