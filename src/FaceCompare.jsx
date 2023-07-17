import React, { useEffect } from 'react';
import * as faceapi from 'face-api.js';
import './FaceCompare.css';
const FaceCompare = () => {

  
    const [modelsLoaded, setModelsLoaded] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
useEffect(() => {
  if(loading){
    let video = document.getElementById("facematchvideo")
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = ["https://i.ibb.co/RzRDYdW/IMG-4649-03.jpg"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`${label}`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
       
      }
      
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
   const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      console.log(result)
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});
setLoading(false)
  }
  
}

, []);



  
  
    return (
        <>
      <div id='facematch ' style={{"position":"relative",width:"600px", height:"450px"}}>
      <video id="facematchvideo"  style={{"position":"absolute"}} width="600" height="450" autoPlay></video>
      </div>
       
        </>
    );
}

export default FaceCompare;
