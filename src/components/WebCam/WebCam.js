import React, { Component } from "react";
import Webcam from "react-webcam";

export class WebCam extends Component {
  setRef = webcam => {
    this.webcam = webcam;
  };
  render() {
    const videoConstraints = {
      //width: 1280,
      //height: 720,
      facingMode: "user"
    };

    return (
      <Webcam
        audio={false}
        //height={350}
        ref={this.setRef}
        screenshotFormat="image/jpeg"
        //width={350}
        videoConstraints={videoConstraints}
      />
    );
  }
}

export default WebCam;
