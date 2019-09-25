import React, { Component } from 'react';
import { Button, Image } from 'grommet';
import PropTypes from 'prop-types';
import { arrayBufferToBase64 } from '../../utill';

export class WebCamCapture extends Component {
  state = {
    image: null,
  };

  componentDidMount() {
    // fetch the image from camera to do facial detection
    fetch('http://localhost:5000/images/output.png', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(response => {
      response.arrayBuffer().then(buffer => {
        const base64Flag = 'data:image/jpeg;base64,';

        const imageStr = arrayBufferToBase64(buffer);
        const image = base64Flag + imageStr;
        this.setState({ image });
      });
    });
  }

  capture = () => {
    const imageSrc = this.state.image;
    this.props.webCamCapture(imageSrc);
  };

  render() {
    return (
      <>
        <Image
          height="200"
          width="300"
          src="http://localhost:5000/images/output.png"
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

// proptypes
WebCamCapture.propTypes = {
  webCamCapture: PropTypes.func.isRequired,
};

export default WebCamCapture;
