// check that the content is running
console.log("content is running");

// when page loads
window.addEventListener('load', init);
function init() {

    // variables
    var socket;
    var currentUsers = [];

    // connect to socket
    socket = io.connect("https://ep1521.itp.io:8096/");
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
            createTracker(user.id, user.it);
        });
    })

    // when you recieve a new user id, update the currentUsers array
    socket.on('sharingNewUser', function (data) {
        // update currentUsers array
        currentUsers.push(data);
        console.log(currentUsers);

        // create a tracker div for the new user
        createTracker(data.id, data.it);
    })

    // when a user discconects, remove them from the currentUsers array
    socket.on('removeAUser', function (data) {
        // update and remove currentUsers array
        var index = currentUsers.findIndex(item => item.id === data);
        currentUsers.splice(index, 1);
        console.log(currentUsers);

        // remove tracker div for user who left
        removeTracker(data)
    })

    // when the user that disconnects is IT, set a new user to IT
    socket.on('newITUser', function (data){
        // make first user in the array IT
        var index = currentUsers.findIndex(item => item.id === data);
        currentUsers[index].it = true;
        console.log(currentUsers);

        // change the color for that tracker
        var tracker = document.getElementById(data);
        tracker.style.backgroundColor = 'black';
    })

    // When you recieve a updated from a tagged occurance
    socket.on('sharingUpdatedItValues', function (data){
        // console.log("Tag occured " + data.newIt + " " + data.oldIt);

        // updated old IT
        var oldIndex = currentUsers.findIndex(item => item.id === data.oldIt);
        currentUsers[oldIndex].it = false;

        // updated new IT
        var newIndex = currentUsers.findIndex(item => item.id === data.newIt);
        currentUsers[newIndex].it = true;
        // console.log(currentUsers)

        // access these trackers
        var oldTracker = document.getElementById(data.oldIt);
        var newTracker = document.getElementById(data.newIt);
        // updated these trackers
        changeTrackerAppearance(newTracker, oldTracker);

        
    })

    function createTracker(id, it) {
        var tracker = document.createElement('Div')
        tracker.id = id;
        tracker.style.position = "absolute";
        tracker.style.width = "3vh";
        tracker.style.height = "3vh";
        tracker.style.borderRadius = "500px";
        if(it){
            tracker.style.backgroundColor = "black";
        }else{
            tracker.style.backgroundColor = "rgba(0, 0, 0, .1";
        }
        //tracker.style.visibility = "hidden"
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
        

        // this thisUser is IT, check if they are overlapping with anyone
        if(type == 1){
            if(currentUsers[index].it){
                currentUsers.forEach(user => {
                    if(user.pos != "undefined" && thisUser.pos != "undefined"){
                        if(user.id !== socket.id &&
                            user.pos.x >= (thisUser.pos.x - 10) && 
                            user.pos.x < (thisUser.pos.x + 10) &&
                            user.pos.y >= (thisUser.pos.y - 10) &&
                            user.pos.y < (thisUser.pos.y + 10)){
    
                                // me : thisUser / them: user
                                console.log("tagged")

                                // access the other tracker
                                var otherTracker = document.getElementById(user.id)

                                // update this clients users with changed IT values
                                currentUsers[index].it = false // make this user not IT
                                currentUsers[currentUsers.findIndex(u => u.id === user.id)].it = true // make the tagged user IT
                                console.log(currentUsers)
                                // change appearance to reflect IT values
                                changeTrackerAppearance(otherTracker, tracker);

                                // send the updated IT values to the server
                                var idsToUpdate = {
                                    newIt: user.id,
                                    oldIt: thisUser.id
                                }
                                socket.emit('tagOccured', idsToUpdate);
    
    
        
                            // change this tracker to not IT
                            // tracker.style.backgroundColor = 'rbga(0, 0, 0, .2)';
        
                            // // change other tracker to IT
                            // var otherTracker = document.getElementById(user.id);
                            // //otherTracker.style.visibility = "visible";
                            // otherTracker.style.backgroundColor = 'black';
            
                        }
                    }
                    
                })
            }
        }        
    }

    function changeTrackerAppearance(newIt, oldIt){
        newIt.style.backgroundColor = 'black';
        oldIt.style.backgroundColor = 'rgba(0, 0, 0, .1';
    }

}