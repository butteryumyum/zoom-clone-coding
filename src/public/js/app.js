
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
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

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input"); //form에서 input 찾아오기
    socket.send(input.value); //front-end의 form에서 back-end로 보냄
    input.value = ""; //내용 비우기
    
}

messageForm.addEventListener("submit", handleSubmit);