
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg); //object를 string으로 만듦
}

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅") // socket이 connection을 open 했을때 로그를 띄움
}) //메시지 받기

socket.addEventListener("message", (message) => {//어떤 메시지를 받았는지
    const li = document.createElement("li"); //새로운 메시지를 받으면, 새로운 li를 만듦
    li.innerText = message.data;
    messageList.append(li); //li를 messageList 안에 넣음
})
socket.addEventListener("close", () => { //서버와 연결이 끊어졌을때
    console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input"); //form에서 input 찾아오기
    socket.send(makeMessage("new_message", input.value)); //front-end의 form에서 back-end로 보냄
    input.value = ""; //내용 비우기
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input"); 
    socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);