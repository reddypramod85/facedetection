import React from 'react';
import { Grommet, Box, Form, Text } from 'grommet';
import { grommet } from 'grommet/themes';
import {
  fetchFaceEntries,
  getPersonList,
  faceRects,
  displayData,
  fetchfaceIds,
  identifyFaceResponse,
} from './utill';
import {
  Canvas,
  DisplayFaceData,
  Header,
  WebCamCapture,
  DisplayPersonList,
} from './components';

class App extends React.Component {
  state = {
    imageData: null,
    faceData: [],
    faceRects: [],
    personList: [],
    faceEntries: [],
    candidatePersons: [],
    faceIdsArray: [],
    error: null,
  };

  captureImage = img => {
    this.setState({ imageData: img });
  };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ faceRects: [] });

    // API call to create a person group
    // try {
    //   const personGroup = await createPersonGroup();
    //   console.log('personGroup', personGroup);
    //   // this.setState({ personList });
    // } catch (error) {
    //   // this.setState({ error });
    // }

    // API call to get the list of all persons in the current person group
    try {
      const personList = await getPersonList();
      this.setState({ personList });
    } catch (error) {
      this.setState({ error });
    }

    // API call to Detect human faces in an image, return face rectangles, and optionally with faceIds,
    // landmarks, and attributes
    try {
      const getFaceEntries = await fetchFaceEntries(this.state.imageData);
      const faceEntries = await getFaceEntries.json();
      this.setState({ faceEntries });
    } catch (error) {
      this.setState({ error });
    }

    // retrieve face ids from the identified faces
    try {
      const faceIdsArray = await fetchfaceIds(this.state.faceEntries);

      this.setState(() => {
        return { faceIdsArray };
      });
    } catch (error) {
      this.setState({ error });
    }

    // Call this after detecting faces, with face IDs,
    // to identify the faces from the people group
    try {
      const getIdentifyFaceResponse = await identifyFaceResponse(
        this.state.faceIdsArray,
      );
      const candidatePersons = await getIdentifyFaceResponse.json();
      this.setState({ candidatePersons });
    } catch (error) {
      this.setState({ error });
    }

    // Get the face location rectangle coordinate/size information
    try {
      const getFaceRects = await faceRects(this.state.faceEntries);

      // this.setState({ faceRects: getFaceRects });
      this.setState(() => {
        return { faceRects: getFaceRects };
      });
    } catch (error) {
      this.setState({ error });
    }

    // Save and display the face data
    try {
      const faceData = await displayData(
        this.state.candidatePersons,
        this.state.personList,
        this.state.faceEntries,
      );
      this.setState(() => {
        return { faceData };
      });
      // this.setState({ faceData: getDisplatData });
    } catch (error) {
      this.setState({ error });
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
            {this.state.error && <Text>Caught an error.</Text>}
            <Box
              direction="row-responsive"
              justify="center"
              align="center"
              pad="small"
              background="dark-2"
              gap="medium"
            >
              <WebCamCapture webCamCapture={this.captureImage} />

              {this.state.imageData && (
                <>
                  {this.state.faceRects.length > 0 ? (
                    <Canvas
                      image={this.state.imageData}
                      facer={this.state.faceRects}
                    />
                  ) : null}
                </>
              )}
            </Box>
            {this.state.imageData && (
              <Box
                direction="row-responsive"
                justify="center"
                pad="medium"
                align="center"
                gap="small"
              >
                <DisplayFaceData showFaceData={this.state.faceData} />
              </Box>
            )}
            {this.state.personList.length > 0 && (
              <Box
                pad="medium"
                align="center"
                gap="small"
                a11yTitle="Person List"
              >
                <DisplayPersonList
                  image={this.state.imageData}
                  personList={this.state.personList}
                />
              </Box>
            )}
          </Form>
        </Box>
      </Grommet>
    );
  }
}

export default App;
