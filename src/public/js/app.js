const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');

let myStream;
let muted = false;
let cameraOff = false;

async function getMidia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            {
                audio: true,
                video: true,
            });
        myFace.srcObject = myStream;
    } catch(e) {
        console.log(e); //에러가 있다면 콘솔에 보여줌
    }
}

getMidia()

function handleMuteClick() {
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        camerOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        camerOff = true;
    }
}

muteBtn.addEventListener("click", handleMuteClick); 
cameraBtn.addEventListener("click", handleCameraClick); 