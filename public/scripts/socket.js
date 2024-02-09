const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
    let mouseObj = null;
    let catObj = null;
    let cheeseObj = null;
    let mouseTrapObj = null;

    const sounds = {
        background: new Audio("asset/background.mp3"),
        collect: new Audio("asset/collect.mp3"),
        gameover: new Audio("asset/gameover.mp3"),
        hit: new Audio("asset/hit.mp3"),
        trigger: new Audio("asset/trigger.mp3"),
        ready: new Audio("asset/ready.mp3"),
    };

    let frameVar;

    const updateFrameVar = function (content) {
        frameVar = content;
    };

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    const setObjects = function (mouse, cat, cheese, mouseTrap) {
        mouseObj = mouse;
        catObj = cat;
        cheeseObj = cheese;
        mouseTrapObj = mouseTrap;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();
        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // socket.emit("get users");
            // socket.emit("get messages");
            $("#socketId").text(socket.id);
            $("#socketId").hide();
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        /* brandon's addition start */
        socket.on("object info", (content) => {
            content = JSON.parse(content);
            if (content.object == "cheese") {
                cheeseObj.setXY(content.xloc, content.yloc);
                cheeseObj.setColor(content.status);
            } else if (content.object == "mouseTrap") {
                mouseTrapObj.setXY(content.xloc, content.yloc);
                if (content.status != "hide") {
                    if (content.status == "close") { sounds.trigger.play() };
                    mouseTrapObj.changeDraw(true);
                    mouseTrapObj.setStatus(content.status);
                } else {
                    mouseTrapObj.changeDraw(false);
                }
            }
        });

        socket.on("mouse hurt", () => {
            sounds.hit.play();
            mouseObj.reduceLife();
            mouseObj.getHurt();
            catObj.setStunned(true);
            setTimeout(function () { catObj.setStunned(false); }, 2000);
        });
        
        socket.on("update sprite", (content) => {
            content = JSON.parse(content);
            if (content.object == "cat") {
                switch (content.type) { 
                    case "move": catObj.move(content.value); break;
                    case "stop": catObj.stop(content.value); break;
                    case "setSpeed": catObj.setSpeed(content.value); break;
                }
            } else if (content.object == "mouse") {
                switch (content.type) {
                    case "move": mouseObj.move(content.value); break;
                    case "stop": mouseObj.stop(content.value); break;
                    case "hurt": mouseObj.getHurt(content.value); break;
                    case "setSpeed": mouseObj.setSpeed(content.value); break;
                }
            }
        });

        socket.on("game over", (content) => {
            const { object, cheese, life } = JSON.parse(content);
            $("#game-over").show();
            $("#start_over").show();
            $("#ranking_table").show();
            sounds.background.pause();
            sounds.collect.pause();
            sounds.background.pause();
            sounds.gameover.play();
            window.cancelAnimationFrame(frameVar);
        });

        socket.on("game start", () => {
            UserPanel.showGame();
            let clickEvent = new Event('click');
            document.getElementById('game-start').dispatchEvent(clickEvent);
        });

        socket.on("countdown", (number) => {
            if (number == 3) {
                document.getElementById("waiting-room").pause();
                sounds.ready.play();
            }
            $('#countdownText').text("Game Starting In...");
            $('#countdown').fadeOut(300);
            $('#countdown').text(number);
            $('#countdown').fadeIn(300);
        });

        socket.on("collect cheese", () => {
            cheeseObj.collectCheese();
            sounds.collect.pause();
            sounds.collect.load();
            sounds.collect.muted = true;
            setTimeout(function () {
                sounds.collect.muted = false;
                sounds.collect.play();
            }, 150);
        });

        socket.on("checking_user_data_table", (data) => {
            document.getElementById("Player_name").innerHTML = data.name;
            document.getElementById("Player_total_win").innerHTML = data.total_sum;
            document.getElementById("win_as_mouse").innerHTML = data.win_as_mouse;
            document.getElementById("win_as_cat").innerHTML = data.win_as_cat;
            document.getElementById("collection_of_cheese").innerHTML = data.cheese_collected;
            document.getElementById("collection_of_mouse").innerHTML = data.mouse_caught;

        });

        /* brandon's addition end */
        socket.on("sorting", (data, win_as_what) => {
            const UserList = JSON.parse(data);
            var allUsers = [];

            for(var key in UserList) {
                allUsers.push(UserList[key]);
            } 

            for (i = 0; i < allUsers.length - 1; i++) {
                for (j = 0; j < allUsers.length - i - 1; j++) {
                    if (allUsers[j].total_sum < allUsers[j+1].total_sum)
                    {   
                        let temp = allUsers[j];
                        allUsers[j] = allUsers[j+1];
                        allUsers[j+1] = temp;
                    }
                }
            }
            if (win_as_what == 0) { // cat win
                $("#winning").text("CAT WINS!");
                document.getElementById("win_as_what").innerHTML = "Win as Cat";
                document.getElementById("collection_of_what").innerHTML = "Times of catching mouse";
            } else if (win_as_what == 1) { // mouse win
                $("#winning").text("MOUSE WINS!");
                document.getElementById("win_as_what").innerHTML = "Win as Mouse";
                document.getElementById("collection_of_what").innerHTML = "Collection of cheese";
            }
    
            let count = 0;
            for (i = 0; i < allUsers.length; i++) {
                if (count == 0) {
                    document.getElementById("Firstplayer").innerHTML = allUsers[i].name;
                    document.getElementById("Firstplayer_total_sum").innerHTML = allUsers[i].total_sum;
                    if (win_as_what == 0) {
                        document.getElementById("Firstplayer_winning_record").innerHTML = allUsers[i].win_as_cat;
                        document.getElementById("Firstplayer_record").innerHTML = allUsers[i].mouse_caught;
                    }
                    if (win_as_what == 1) {
                        document.getElementById("Firstplayer_winning_record").innerHTML = allUsers[i].win_as_mouse;
                        document.getElementById("Firstplayer_record").innerHTML = allUsers[i].cheese_collected;
                    }
                }

                if (count == 1) {
                    document.getElementById("Secondplayer").innerHTML = allUsers[i].name;
                    document.getElementById("Secondplayer_total_sum").innerHTML = allUsers[i].total_sum;
                    if (win_as_what == 0) {
                        document.getElementById("Secondplayer_winning_record").innerHTML = allUsers[i].win_as_cat;
                        document.getElementById("Secondplayer_record").innerHTML = allUsers[i].mouse_caught;
                    }
                    if (win_as_what == 1) {
                        document.getElementById("Secondplayer_winning_record").innerHTML = allUsers[i].win_as_mouse;
                        document.getElementById("Secondplayer_record").innerHTML = allUsers[i].cheese_collected;
                    }
                }

                if (count == 2) {
                    document.getElementById("Thirdplayer").innerHTML = allUsers[i].name;
                    document.getElementById("Thirdplayer_total_sum").innerHTML = allUsers[i].total_sum;
                    if (win_as_what == 0) {
                        document.getElementById("Thirdplayer_winning_record").innerHTML = allUsers[i].win_as_cat;
                        document.getElementById("Thirdplayer_record").innerHTML = allUsers[i].mouse_caught;
                    }
                    if (win_as_what == 1) {
                        document.getElementById("Thirdplayer_winning_record").innerHTML = allUsers[i].win_as_mouse;
                        document.getElementById("Thirdplayer_record").innerHTML = allUsers[i].cheese_collected;
                    }
                }

                if (count == 3) {
                    document.getElementById("Fourthplayer").innerHTML = allUsers[i].name;
                    document.getElementById("Fourthplayer_total_sum").innerHTML = allUsers[i].total_sum;
                    if (win_as_what == 0) {
                        document.getElementById("Fourthplayer_winning_record").innerHTML = allUsers[i].win_as_cat;
                        document.getElementById("Fourthplayer_record").innerHTML = allUsers[i].mouse_caught;
                    }
                    if (win_as_what == 1) {
                        document.getElementById("Fourthplayer_winning_record").innerHTML = allUsers[i].win_as_mouse;
                        document.getElementById("Fourthplayer_record").innerHTML = allUsers[i].cheese_collected;
                    }
                }

                if (count == 4) {
                    document.getElementById("Fifthplayer").innerHTML = allUsers[i].name;
                    document.getElementById("Fifthplayer_total_sum").innerHTML = allUsers[i].total_sum;
                    if (win_as_what == 0) {
                        document.getElementById("Fifthplayer_winning_record").innerHTML = allUsers[i].win_as_cat;
                        document.getElementById("Fifthplayer_record").innerHTML = allUsers[i].mouse_caught;
                    }
                    if (win_as_what == 1) {
                        document.getElementById("Fifthplayer_winning_record").innerHTML = allUsers[i].win_as_mouse;
                        document.getElementById("Fifthplayer_record").innerHTML = allUsers[i].cheese_collected;
                    }
                }
                count++;
            }

        });

        socket.on("passWinMsg", (collectedCheese, final_caught, status) => {
            socket.emit("update_new_data", "cat", collectedCheese, final_caught, status);
        });

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        $("#information_table").hide();
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    /* brandon's addition start */
    const passObjectInfo = function (object, xloc, yloc, status) {
        if (socket && socket.connected) {
            const content = {object : object, xloc : xloc, yloc : yloc, status : status};
            socket.emit("object info", JSON.stringify(content));
        }
    };

    const mouseHurt = function () {
        if (socket && socket.connected) {
            socket.emit("mouse hurt");
        }
    };

    const updateSprite = function (object, type, value) {
        if (socket && socket.connected) {
            const content = {object : object, type : type, value : value};
            socket.emit("update sprite", JSON.stringify(content));
        }
    };

    const gameOver = function (object, cheese, life) {
        if (socket && socket.connected) {
            const content = {object : object, cheese : cheese, life : life};
            socket.emit("game over", JSON.stringify(content));
        }
    };

    const mouseCollectCheese = function () {
        if (socket && socket.connected) {
            socket.emit("collect cheese");
        }
    };
    /* brandon's addition end */

    const update_new_data = function (role, collectedCheese, final_caught, status){
        socket.emit("update_new_data", role, collectedCheese, final_caught, status);
    }

    const sort = function (win_as_what) {
        socket.emit("get_jsonfile", win_as_what);
    }

    const passWinMsg = function (collectedCheese, final_caught, status) {
        socket.emit("passWinMsg", collectedCheese, final_caught, status);
    }

    const checking_user_data = function() {
        socket.emit("checking_user_data");
    }

    return { checking_user_data, getSocket, setObjects, connect, disconnect, postMessage, passObjectInfo, mouseHurt, updateSprite, gameOver, update_new_data, sort, updateFrameVar, mouseCollectCheese, passWinMsg};
})();
