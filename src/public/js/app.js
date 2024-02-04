const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");


room.hidden = true; //방 내부 숨기기

let roomName; // 방 이름

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input"); //#msg form 안에 있는 input을 찾음
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=> {//backend로 첫번째 argument인 input.value와 함께 new_message event를 보냄
        addMessage(`You: ${value}`); //그 뒤에 호출될 function
    });
    input.value = "";
        
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input"); //#name form에서 input을 가져옴
    socket.emit("nickname", input.value);
}
function ShowRoom() {
    welcome.hidden = true; //방이름 입력 숨기기
    room.hidden = false; // 방 내부 보이기
    const h3 = room.querySelector("h3"); //h3 태그 가져오기
    h3.innerText = `Room ${roomName}`; //방 이름을 입력받은 값으로 변경
    const msgForm = room.querySelector("#msg"); //welcome을 숨기고 room을 보여준 showRoom에서 form을 찾음
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, ShowRoom);//backend로 명령을 보냄
    roomName = input.value;
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit); 

//
socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

socket.on("bye", (left) => {
    addMessage(`${left} Left!`);
});
socket.on("new_message", addMessage)
