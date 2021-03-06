// Put variables in global scope to make them available to the browser console.
const constraints = window.constraints = {
  audio: true,
  video: true
};

var track;

var worker;

function handleSuccess(stream) {
  const video = document.querySelector('video');
  const videoTracks = stream.getVideoTracks();
  console.log(`Using video device: ${videoTracks[0].label}`);
  track = videoTracks[0];
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

function sendFrameToWorker(newFrame) {
  worker.postMessage(newFrame);
}

function addTrackReader() {
  var track_reader = new VideoTrackReader(track);
  track_reader.start(sendFrameToWorker);
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    const v = constraints.video;
    errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);

    worker = new Worker("frame_worker.js");

    worker.addEventListener('message', function(e) {
      document.getElementById('workerMsg').textContent = "Msg from worker: " + e.data;
      console.log(e.data);
    }, false);

  } catch (e) {
    handleError(e);
  }
}