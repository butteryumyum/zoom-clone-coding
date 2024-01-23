const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true; //방 내부 숨기기

let roomName; // 방 이름

function ShowRoom() {
    welcome.hidden = true; //방이름 입력 숨기기
    room.hidden = false; // 방 내부 보이기
    const h3 = room.querySelector("h3"); //h3 태그 가져오기
    h3.innerText = `Room ${roomName}`; //방 이름을 입력받은 값으로 변경
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, ShowRoom);//backend로 명령을 보냄
    roomName = input.value;
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit); 