import React, { Component } from "react";
import { DataTable, Text } from "grommet";
import PropTypes from "prop-types";

export class DisplayFaceData extends Component {
  state = {
    name: "",
    confidence: "",
    gender: "",
    age: "",
    smile: "",
    hair: ""
  };
  render() {
    return (
      <DataTable
        columns={[
          {
            property: "name",
            header: <Text>Name</Text>,
            primary: true
          },
          {
            property: "confidence",
            header: <Text>Confidence</Text>,
            primary: true
          },
          {
            property: "gender",
            header: <Text>Gender</Text>,
            primary: true
          },
          {
            property: "age",
            header: <Text>Age</Text>,
            primary: true
          },
          {
            property: "hair",
            header: <Text>Hair</Text>,
            primary: true
          },
          {
            property: "glasses",
            header: <Text>Glasses</Text>,
            primary: true
          },
          {
            property: "emotions",
            header: <Text>Emotions</Text>,
            primary: true
          },
          {
            property: "smile",
            header: <Text>Smile</Text>,
            primary: true
          }
        ]}
        data={this.props.showFaceData}
      />
    );
  }
}

//proptypes
DisplayFaceData.propTypes = {
  showFaceData: PropTypes.array.isRequired
};

export default DisplayFaceData;
