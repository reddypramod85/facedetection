import React from 'react';
import PropTypes from 'prop-types';

class Canvas extends React.Component {
  // draw the canvas image with face rectangles
  componentDidMount() {
    const ctx = this.canvas.getContext('2d');
    this.imag.onload = () => {
      ctx.drawImage(this.imag, 0, 0, this.canvas.width, this.canvas.height);
      ctx.strokeStyle = '#FF0000';
      // ctx.strokeRect(60, 20, 100, 100);
      // ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      let count = 0;
      this.props.facer.map(faceRect => {
        // highlight the face with info displayed on the right
        if (count === 0) ctx.lineWidth = 6;
        ctx.strokeRect(
          faceRect.left,
          faceRect.top,
          faceRect.width,
          faceRect.height,
        );
        ctx.lineWidth = 2;
        count += 1;
        return null;
      });
    };
  }

  render() {
    return (
      <>
        <canvas
          width={300}
          height={200}
          ref={can => {
            this.canvas = can;
          }} // width={350} height={200}
        />
        <img
          ref={img => {
            this.imag = img;
          }}
          alt=""
          src={this.props.image}
          style={{ display: 'none' }}
        />
      </>
    );
  }
}

// proptypes
Canvas.propTypes = {
  image: PropTypes.string.isRequired,
  facer: PropTypes.array.isRequired,
};

export default Canvas;
