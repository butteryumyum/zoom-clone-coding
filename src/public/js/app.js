
const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅") // socket이 connection을 open 했을때 로그를 띄움
}) //메시지 받기

socket.addEventListener("message", (message) => {//어떤 메시지를 받았는지
    console.log("New Message:", message.data, "from the server")
})
socket.addEventListener("close", () => { //서버와 연결이 끊어졌을때
    console.log("Disconnected from Server ❌");
});

