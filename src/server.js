import  express  from "express";
import http from "http";
import SocketIo from "socket.io";


const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));  //유저가 public으로 가게 되면 __dirname + "/public을 보여줌
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));



//http 서버
const httpServer = http.createServer(app); //requestListener 경로를 지정해야함. 그게 위에서 만든 app이 됨 
//socketio 서버
const wsServer = SocketIo(httpServer); 

wsServer.on("connection", socket => {
    socket.on("join_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome"); 
    });
    socket.on("offer",(offer, roomName) => {
        socket.to(roomName).emit("offer", offer); //이벤트가 다시 브라우저로 offer와 같이 가게됨.
    });
});

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);

