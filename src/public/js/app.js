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
let myPeerConnection;

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

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMidia();
    makeConnection();
}

async function handleWelcomeSubmit() {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}


welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async() => { //누군가 방에 들어왔을때 
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer); //먼저 들어와있는 브라우저(peer A)에서만 작동함 
    console.log("sent the offer");
    socket.emit("offer", offer, roomName); //다른 브라우저(peer B)로 offer 보내기
});

socket.on("offer", async(offer) => {
    myPeerConnection.setRemoteDescription(offer); //원래 브라우저가 offer를 받고 그 offer로  setRemoteDescription을 함
    console.log("received the offer");
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);

});

socket.on("ice", ice => {
    console.log("received the candidate");
    myPeerConnection.addIceCandidate(ice);
})

//RTC code

function makeConnection() { //양쪽 브라우저의 peer to peer 연결
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce); 
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) { //브라우저끼리 dandidate들을 서로 주고 받음
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace"); //상대 비디오
    peerFace.srcObject = data.stream;
   
}