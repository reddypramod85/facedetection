import React, { Component } from "react";
import Webcam from "react-webcam";
import { Button } from "grommet";
import PropTypes from "prop-types";

export class WebCamCapture extends Component {
  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.props.webCamCapture(imageSrc);
  };
  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };
    return (
      <>
        <Webcam
          audio={false}
          height={350}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
        />
        <Button
          type="submit"
          onClick={this.capture}
          primary
          label="Detect Face"
        />
      </>
    );
  }
}

//proptypes
WebCamCapture.propTypes = {
  webCamCapture: PropTypes.func.isRequired
};

export default WebCamCapture;
