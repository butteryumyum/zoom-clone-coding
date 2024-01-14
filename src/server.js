import  express  from "express";
import http from "http";
import {WebSocketServer} from "ws";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));  //유저가 public으로 가게 되면 __dirname + "/public을 보여줌
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

//http 서버
const server = http.createServer(app); //requestListener 경로를 지정해야함. 그게 위에서 만든 app이 됨 
// webSocket 서버
const wss = new WebSocketServer({ server }); //서버를 전달(pass)해서 서버 두개를 동시에 구동

function OnSocketClose() {
    console.log("Disconnected from Server ❌")
}

const sockets = []; //누군가 연결하면 connection을 이 DB?(array)에 넣을꺼임

wss.on("connection", (socket) => { //connection 이 생겼을 때, socket으로 메시지를 보냄
    socket["nickname"] = "Anon"; //socket에 nickname(익명)을 줌
    sockets.push(socket);
    console.log("Connected to Browser ✅")
    socket.on("close", OnSocketClose); //브라우저가 닫혔을 때 log를 띄움
    socket.on('message', (msg) => {
        const message = JSON.parse(msg); 
        switch (message.type) {
            case "new_message"://type이 메시지일 경우 화면에 표시
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));//닉네임 property를 socket object에 저장
            case "nickname": //type이 닉네임일 경우 닉네임을 socket에 넣어줌
                socket["nickname"] = message.payload
        }
    });
        
    
});
 
server.listen(3000, handleListen);

