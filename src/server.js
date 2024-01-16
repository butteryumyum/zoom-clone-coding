import  express  from "express";
import SocketIO from "socket.io";
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
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    console.log(socket); //backend에서 connection을 받음
})


/*const sockets = []; //누군가 연결하면 connection을 이 DB?(array)에 넣을꺼임

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
});*/
 
httpServer.listen(3000, handleListen);

