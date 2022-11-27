import { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import { drawPoint, drawSegment } from "../utils/helper";
import { POINTS, keypointConnections } from "../utils/data";
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

const App = () => {
  const [isStartBikefit, setIsStartBikefit] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //INITIALIZE MOVENET MODEL
  const runMovenet = async () => {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    const ctx = canvasRef.current.getContext("2d");
    ctx.translate(canvasRef.current.width, 0);
    ctx.scale(-1, 1);
    setInterval(() => {
      detectPose(detector, ctx);
    }, 20);
  };

  const detectPose = async (detector, ctx) => {
    if (
      //CHECK IF CAMERA IS READY
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(keypoint.name === "left_eye" || keypoint.name === "right_eye")
            ) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(255,255,255");
              let connections = keypointConnections[keypoint.name];
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase();
                  drawSegment(
                    ctx,
                    [keypoint.x, keypoint.y],
                    [
                      keypoints[POINTS[conName]].x,
                      keypoints[POINTS[conName]].y,
                    ],
                    "rgb(255,255,255)"
                  );
                });
              } catch (error) {}
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const startBikefit = () => {
    setIsStartBikefit(true);
    runMovenet();
  };

  if (isStartBikefit) {
    return (
      <div>
        <Webcam
          mirrored={true}
          width="640px"
          height="480px"
          id="webcam"
          ref={webcamRef}
          style={{
            position: "absolute",
            left: 120,
            top: 100,
            padding: "0px",
          }}
        />

        <canvas
          width="640px"
          height="480px"
          id="canvas"
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 120,
            top: 100,
            padding: "0px",
          }}
        ></canvas>
      </div>
    );
  }
  return (
    <div className="App">
      <h1>Bike Fitter App</h1>
      <button onClick={startBikefit}>Start a session</button>
    </div>
  );
};

export default App;
