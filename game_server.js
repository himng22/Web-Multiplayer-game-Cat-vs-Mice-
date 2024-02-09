const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for the user data correctness
    //
    if (!username || !name || !password) {
        res.json({ status: "error", error: "Username/Name/Password cannot be empty!" });
        return;
    }
    else if (!containWordCharsOnly(username)) {
        res.json({ status: "error", error: "Username should only contain underscores, letters or numbers!" });
        return;
    }
    else if (username in users) {
        res.json({ status: "error", error: "Username already taken!" });
        return;
    }
    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {name, role: "", password: hash, total_sum: "0", win_as_mouse: "0", win_as_cat: "0", cheese_collected: "0", mouse_caught: "0"};
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });
});

let mouse_player_no = 0;
let cat_player_no = 0;

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;
    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for username/password
    //

    if (!username || !password) {
        res.json({ status: "error", error: "Username/Password cannot be empty!" });
        return;
    } else if (username in users === false) {
        res.json({ status: "error", error: "User does not exist!" });
        return;
    } else if (users[username].role != "") {
        res.json({ status: "error", error: "User already logged in!" });
        return;
    } else if (!bcrypt.compareSync(password, users[username]['password'])) {
        res.json({ status: "error", error: "Incorrect password!" });
        return;
    } else if (mouse_player_no + cat_player_no >= 2) {
        res.json({ status: "error", error: "Too many players online!" });
        return;
    }
    //
    // G. Sending a success response with the user account
    //
    if (mouse_player_no < cat_player_no) {
        users[username].role = "mouse";
        mouse_player_no++;
    }
    else if (mouse_player_no > cat_player_no) {
        users[username].role = "cat";
        cat_player_no++;
    }
    else {
        users[username].role = "mouse";
        mouse_player_no++;
    }

    fs.writeFileSync("data/users.json", JSON.stringify(users));
    // distribute role
    req.session.user = { username, name: users[username].name, role: users[username].role};
    res.json({ status: "success", user: { username, name: users[username].name, role: users[username].role} });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
    //
    // B. Getting req.session.user
    //
    if (req.session.user != null) {
        const {username} = req.session.user;
        const users = JSON.parse(fs.readFileSync("data/users.json"));

        if (users[username].role != "mouse" || users[username].role != "cat" ) {
            if (mouse_player_no < cat_player_no) {
                users[username].role = "mouse";
                mouse_player_no++;
            }
            else if (mouse_player_no > cat_player_no) {
                users[username].role = "cat";
                cat_player_no++;
            }
            else {
                users[username].role = "mouse";
                mouse_player_no++;
            }
        
            fs.writeFileSync("data/users.json", JSON.stringify(users));
        }

    }

    if (req.session.user) {
        res.json({ status: "success", user: req.session.user });
        return;
    } else {
        res.json({ status: "error", error: "You have not signed in." });
        return;
    }
    //
    // D. Sending a success response with the user account
    //
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
    //
    // Deleting req.session.user
    //
    delete req.session.user;
    //
    // Sending a success response
    //
    res.json({ status: "success" });
});


//
// ***** Please insert your Lab 6 code here *****
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const { json } = require("stream/consumers");
const httpServer = createServer(app);
const io = new Server(httpServer);

const onlineUsers = {};

io.on("connection", (socket) => {
    if (socket.request.session.user) {
        const { username, name } = socket.request.session.user;

        //distribute role

        onlineUsers[username] = { name };
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }

    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;

            const users = JSON.parse(fs.readFileSync("data/users.json"));
            if (users[username].role == "mouse") {
                mouse_player_no--;
                users[username].role = "";
            }
            if (users[username].role == "cat"){
                cat_player_no--;
                users[username].role = "";
            }
            fs.writeFileSync("data/users.json", JSON.stringify(users));
            
            if (onlineUsers[username]) delete onlineUsers[username];
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
    });

    socket.on("passObjectInfo", () => {
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    /* brandon's addition start */
    socket.on("object info", (content) => {
        socket.broadcast.emit("object info", content);
    });

    socket.on("mouse hurt", (content) => {
        socket.broadcast.emit("mouse hurt", content);
    });

    socket.on("update sprite", (content) => {
        socket.broadcast.emit("update sprite", content);
    });

    socket.on("game over", (content) => {
        socket.broadcast.emit("game over", content);
    });

    socket.on("collect cheese", () => {
        socket.broadcast.emit("collect cheese");
    });
    //countdown
    if ((mouse_player_no + cat_player_no) % 2 == 0) {
        setTimeout(function () {
            io.emit("countdown", 3);
            setTimeout(function () {
                io.emit("countdown", 2);
                setTimeout(function () {
                    io.emit("countdown", 1);
                    setTimeout(function () {
                        io.emit("game start");
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }
    /* brandon's addition end */
    socket.on("update_new_data", (role, collectedCheese, final_caught, status) => {
        const { username } = socket.request.session.user;
        const users = JSON.parse(fs.readFileSync("data/users.json"));

        if (role == "mouse") {
            if (status == 1) {
                users[username].win_as_mouse = JSON.parse(parseInt(users[username].win_as_mouse) + 1);
                users[username].total_sum = JSON.parse(parseInt(users[username].total_sum) + 1);
            }
            users[username].cheese_collected = JSON.parse(parseInt(users[username].cheese_collected) + parseInt(collectedCheese));
        }
        if (role == "cat") {
            if (status == 1) {
                users[username].win_as_cat = JSON.parse(parseInt(users[username].win_as_cat) + 1);
                users[username].total_sum = JSON.parse(parseInt(users[username].total_sum) + 1);
            }
            users[username].mouse_caught = JSON.parse(parseInt(users[username].mouse_caught) + parseInt(final_caught));
        }

        fs.writeFileSync("data/users.json", JSON.stringify(users));
        
    });

    socket.on("get_jsonfile", (win_as_what) => {
        const users = JSON.parse(fs.readFileSync("data/users.json"));
        io.emit("sorting", JSON.stringify(users), win_as_what);
    });

    socket.on("passWinMsg", (collectedCheese, final_caught, status) => {
        socket.broadcast.emit("passWinMsg", collectedCheese, final_caught, status);
    });

    socket.on("checking_user_data", () => {
        const {username} = socket.request.session.user;        
        const users = JSON.parse(fs.readFileSync("data/users.json"));
        
        let List = users[username];

        socket.emit("checking_user_data_table", List);
    });


});

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});
