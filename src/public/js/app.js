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
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=> {//backend로 첫번째 argument인 input.value와 함께 new_message event를 보냄
        addMessage(`You:${value}`); //그 뒤에 호출될 function
    });
    input.value = "";
        
}

function ShowRoom() {
    welcome.hidden = true; //방이름 입력 숨기기
    room.hidden = false; // 방 내부 보이기
    const h3 = room.querySelector("h3"); //h3 태그 가져오기
    h3.innerText = `Room ${roomName}`; //방 이름을 입력받은 값으로 변경
    const form = room.querySelector("form"); //welcome을 숨기고 room을 보여준 showRoom에서 form을 찾음
    form.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, ShowRoom);//backend로 명령을 보냄
    roomName = input.value;
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit); 


socket.on("welcome", () => {
    addMessage("someone joined!");
});

socket.on("bye", () => {
    addMessage("someone left ㅠㅠ");
});
socket.on("new_message", addMessage)
