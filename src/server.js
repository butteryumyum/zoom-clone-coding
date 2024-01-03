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

function OnSocketMessage(message) {
    console.log(message.toString('utf8'));
}

wss.on("connection", (socket) => { //connection 이 생겼을 때, socket으로 메시지를 보냄
    console.log("Connected to Browser ✅")
    socket.on("close", OnSocketclose); //브라우저가 닫혔을 때 log를 띄움
    socket.on("message", OnSocketMessage);
    socket.send("hello"); 
});
 
server.listen(3000, handleListen);