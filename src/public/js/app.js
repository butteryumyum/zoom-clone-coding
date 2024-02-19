const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

const welcome = document.getElementById('welcome');
const call = document.getElementById('call');

call.hiiden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0]; //videoTrack의 첫번째 track을 가져옴
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) { //사용하는 카메라가 제일 먼저 보여지게 만듦
                option.selected = true; //이 option은 선택된 것이라 해줌
            }
            camerasSelect.appendChild(option);
        })
    }catch(e) {
        console.log(e);

    }
}

async function getMidia(deviceId) {
    const initialConstrains = { //디바이스id가 없을 때 실행
        audio: true,
        video: {facingMode: "user"},
    };
    const cameraConstraints = { //디바이스id가 있을 때 실행
        audio: true,  
        video: {deviceId: { exact: deviceId} },
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstraints : initialConstrains
            ); //deviceid가 있다면 cameraConstraints 사용, 없으면 initialConstraints
        myFace.srcObject = myStream;

    if (!deviceId) { //device가 없다면 카메라를 가져옴 처음 딱 한번만 실행됨
        await getCameras();
    }
       
    } catch(e) {
        console.log(e); //에러가 있다면 콘솔에 보여줌
    }
}



function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track => track.enabled = !track.enabled)); //!track.enabled는 현재상태에 반대를 해줌
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track => track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMidia(camerasSelect.value);
    if (muted) { //mute상태로 카메라 전환시 mute가 유지되게 하는 코드
        myStream.getAudioTracks().forEach((track) => (track.enabled = false));
        } else {
        myStream.getAudioTracks().forEach((track) => (track.enabled = true));
        }
    
}

muteBtn.addEventListener("click", handleMuteClick); 
cameraBtn.addEventListener("click", handleCameraClick); 
camerasSelect.addEventListener("input", handleCameraChange);

//welcome Form

const welcomeForm = welcome.querySelector("form");

function startMedia() {
    welcome.hidden = true;
    call.hidden = false;
    getMidia();
}

function handleWelcomeSubmit() {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value;
    input.value = "";
}


welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", () => { //누군가 방에 들어왔을때 
    console.log("someone join!"); //someone join을 출력
});