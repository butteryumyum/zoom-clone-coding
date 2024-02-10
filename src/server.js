import  express  from "express";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
import http from "http";


const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));  //유저가 public으로 가게 되면 __dirname + "/public을 보여줌
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

//http 서버
const httpServer = http.createServer(app); //requestListener 경로를 지정해야함. 그게 위에서 만든 app이 됨 
//socketio 서버
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["http://admin.socket.io"],
        credentials: true,
    }
});

instrument(wsServer,{
    auth: false,
});


function publicRooms() {
    const {
        sockets: {
            adapter: 
                {sids, rooms},
        },
    } = wsServer; //wsServer안에서 sockets안의 adapter를 갖고  sids와 rooms를 갖고옴 
    
    const publicRooms = [];
    rooms.forEach((_, key) => { //public룸을 가져오는 코드
        if(sids.get(key) === undefined) {//sids와 rooms의 id(key)거 서로 맞지 않으면 undefined이므로 public방을 찾음
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets .adapter.rooms.get(roomName)?.size
}


wsServer.on("connection", (socket) => {
    socket["nickname"] = "Unknown";
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter)
        console.log(`Socket Event: ${event}`);
    });

    //어던 유저가 나갔다 들어왔는지 보냄
   socket.on("enter_room", (roomName, done) => { //frontend에서 받은 done에 해당하는 ShowRoom 값을 받음
    socket.join(roomName);
    done(); //fornt에 있는 showRoom()을 실행함
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //메시지를 하나의 socket에만 보냄
    wsServer.sockets.emit("room_change", publicRooms()); //메시지를 모든 socket에 보냄
     
   }); 
   socket.on("disconnecting", () => { //socket이 방을 떠나기 직전에 실행되는 event
    socket.rooms.forEach((room) => 
        socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
   });
   socket.on('disconnect', () => { //
        wsServer.sockets.emit("room_change", publicRooms());
   });


   socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done(); //done function 호출
   });
   socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
}); //nickname event가 발생하면 nickname을 가져와 socket에 저장함


/*
const sockets = []; //누군가 연결하면 connection을 이 DB?(array)에 넣을꺼임

wss.on("connection", (socket) => { //connection 이 생겼을 때, socket으로 메시지를 보냄
    socket["nickname"] = "Anon"; //socket에 nickname(익명)을 줌
    sockets.push(socket);
    console.log("Connected to Browser ✅")
    socket.on("close", OnSocketClose); //브라우저가 닫혔을 때 log를 띄움
    socket.on('message', (msg) => { //브라우저에서 보낸 메시지 도착
        const message = JSON.parse(msg); 
        switch (message.type) {
            case "new_message"://type이 메시지일 경우 화면에 표시
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));//닉네임 property를 socket object에 저장
            break;
                case "nickname": //type이 닉네임일 경우 닉네임을 socket에 넣어줌
                socket["nickname"] = message.payload
            break;
        }
    });
});
*/
 
httpServer.listen(3000, handleListen);

