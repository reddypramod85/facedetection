import React from "react";
import { Grommet, Box, Form } from "grommet";
import { grommet } from "grommet/themes";
import WebCamCapture from "./components/WebCamCapture/WebCamCapture";
import Header from "./components/Layout/Header";
import DisplayFaceData from "./components/DisplayFaceData/DisplayFaceData";
import {
  fetchFaceEntries,
  getPersonList,
  faceRects,
  displayData,
  fetchfaceIds,
  identifyFaceResponse
} from "./utill";
import Canvas from "./components/Canvas/Canvas";
import DisplayPersonList from "./components/DisplayPersonList/DisplayPersonList";

class App extends React.Component {
  state = {
    imageData: null,
    image_name: "",
    saveImage: false,
    sendImage: "",
    faceData: [],
    faceRects: [],
    personList: [],
    faceEntries: [],
    candidatePersons: [],
    faceIdsArray: []
  };

  captureImage = img => {
    this.setState({ imageData: img });
  };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ faceRects: [] });

    // API call to get the list of all persons in the current person group
    try {
      const persnlist = await getPersonList();
      this.setState({ personList: persnlist });
    } catch (error) {
      console.log(error);
    }

    // API call to Detect human faces in an image, return face rectangles, and optionally with faceIds,
    // landmarks, and attributes
    try {
      const getFaceEntries = await fetchFaceEntries(this.state.imageData);
      const getFaceEntriesList = await getFaceEntries.json();
      this.setState({ faceEntries: getFaceEntriesList });
    } catch (error) {
      console.log(error);
    }
    
    // retrieve face ids from the identified faces
    try {
      const getFaceIds = await fetchfaceIds(this.state.faceEntries);
      this.setState({ faceIdsArray: getFaceIds });
    } catch (error) {
      console.log(error);
    }

    // Call this after detecting faces, with face IDs,
    // to identify the faces from the people group
    try {
      const getIdentifyFaceResponse = await identifyFaceResponse(
        this.state.faceIdsArray
      );
      const candidatePersons = await getIdentifyFaceResponse.json();
      this.setState({ candidatePersons: candidatePersons });
    } catch (error) {
      console.log(error);
    }

    // Get the face location rectangle coordinate/size information
    try {
      const getFaceRects = await faceRects(this.state.faceEntries);

      this.setState({ faceRects: getFaceRects });
    } catch (error) {
      console.log(error);
    }

    // Save and display the face data
    try {
      const getDisplatData = await displayData(
        this.state.candidatePersons,
        this.state.personList,
        this.state.faceEntries
      );
      this.setState({ faceData: getDisplatData });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <Grommet theme={grommet}>
        <Box
          direction="row-responsive"
          justify="center"
          align="center"
          pad="small"
          background="dark-2"
          gap="medium"
        >
          <Form onSubmit={this.handleSubmit}>
            <Header />

            <Box
              direction="row-responsive"
              justify="center"
              align="center"
              pad="small"
              background="dark-2"
              gap="medium"
            >
              <WebCamCapture webCamCapture={this.captureImage} />

              {this.state.imageData ? (
                <>
                  {this.state.faceRects.length > 0 ? (
                    <Canvas
                      image={this.state.imageData}
                      facer={this.state.faceRects}
                    />
                  ) : null}
                </>
              ) : null}
            </Box>
            {this.state.imageData ? (
              <Box
                direction="row-responsive"
                justify="center"
                pad="medium"
                align="center"
                gap="small"
              >
                <DisplayFaceData showFaceData={this.state.faceData} />
              </Box>
            ) : null}
            {this.state.personList.length > 0 ? (
              <Box pad="medium" align="center" gap="small">
                <DisplayPersonList
                  image={this.state.imageData}
                  personList={this.state.personList}
                />
              </Box>
            ) : null}
          </Form>
        </Box>
      </Grommet>
    );
  }
}

export default App;
