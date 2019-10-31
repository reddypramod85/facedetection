import React, { Component } from 'react';
import { Button, Image } from 'grommet';
import PropTypes from 'prop-types';
import { arrayBufferToBase64, resizeImage } from '../../utill';

export class WebCamCapture extends Component {
  state = {
    resizedImage: null,
  };

  async componentDidMount() {
    // Current camera Image URL
    const cameraImageUrl = process.env.REACT_APP_CAMERA_IMAGE_URL;
    // fetch the image from camera to do facial detection
    const response = await fetch(cameraImageUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const buffer = await response.arrayBuffer();
    const base64Flag = 'data:image/jpeg;base64,';
    const imageStr = await arrayBufferToBase64(buffer);
    const image = base64Flag + imageStr;
    await resizeImage(image, result => {
      this.setState({ resizedImage: result });
      return result;
    });
  }

  capture = () => {
    const imageSrc = this.state.resizedImage;
    this.props.webCamCapture(imageSrc);
  };

  render() {
    return (
      <>
        <Image height="400" width="600" src={this.state.resizedImage} />
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

// proptypes
WebCamCapture.propTypes = {
  webCamCapture: PropTypes.func.isRequired,
};

export default WebCamCapture;
