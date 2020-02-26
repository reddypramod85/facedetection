import React from 'react';
import { Grommet, Button, Box, Form, Text } from 'grommet';
import { grommet } from 'grommet/themes';
import {
  fetchFaceEntries,
  getPersonList,
  faceRects,
  displayData,
  fetchfaceIds,
  identifyFaceResponse,
  createPerson,
  addImage,
  trainPersonGroup,
} from './utill';
import {
  Canvas,
  DisplayFaceData,
  Header,
  WebCamCapture,
  DisplayPersonList,
  CreatePerson,
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
    personName: null,
    message: null,
  };

  captureImage = img => {
    this.setState({ imageData: img });
  };

  updatePersonsList = (personList, name) => {
    this.setState({ personList });
    this.setState({ message: 'Successfully deleted a person ' + name });
  };

  // create a new person in a specified person group
  captureName = async name => {
    this.setState({ personName: name });
    try {
      const personResponse = await createPerson(name);
      if (personResponse) {
        this.setState({
          message: 'Successfully created a person ' + name,
        });
      }
      await addImage(this.state.imageData, personResponse.personId);
      await this.trainModel;
    } catch (error) {
      this.setState({ message: error });
    }
    const personList = await getPersonList();
    this.setState({ personList });
  };

  // API call to get the list of all persons in the current person group
  getPersonList = async () => {
    try {
      const personList = await getPersonList();
      this.setState({ personList });
    } catch (error) {
      this.setState({ message: error });
    }
  };

  trainModel = async () => {
    const trainingResponse = await trainPersonGroup();
    if (trainingResponse.status === 'succeeded') {
      this.setState({
        message: 'Training Success',
      });
    }
    if (trainingResponse.status === 'failed') {
      this.setState({
        message: 'Training Failed',
      });
    }
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
      this.setState({ message: error });
    }

    // API call to Detect human faces in an image, return face rectangles, and optionally with faceIds,
    // landmarks, and attributes
    try {
      const getFaceEntries = await fetchFaceEntries(this.state.imageData);
      const faceEntries = await getFaceEntries.json();
      this.setState({ faceEntries });
    } catch (error) {
      this.setState({ message: error });
    }

    // retrieve face ids from the identified faces
    try {
      const faceIdsArray = await fetchfaceIds(this.state.faceEntries);

      this.setState(() => {
        return { faceIdsArray };
      });
    } catch (error) {
      this.setState({ message: error });
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
      this.setState({ message: error });
    }

    // Get the face location rectangle coordinate/size information
    try {
      const getFaceRects = await faceRects(this.state.faceEntries);

      // this.setState({ faceRects: getFaceRects });
      this.setState(() => {
        return { faceRects: getFaceRects };
      });
    } catch (error) {
      this.setState({ message: error });
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
      this.setState({ message: error });
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
            {this.state.message && (
              <Box
                direction="row-responsive"
                justify="center"
                pad="medium"
                align="center"
                gap="small"
                background="light-4"
              >
                <Text
                  color="status-critical"
                  Font
                  weight="bold"
                  textAlign="center"
                >
                  {this.state.message}
                </Text>
              </Box>
            )}

            {this.state.imageData && (
              <Box
                direction="row-responsive"
                justify="center"
                pad="medium"
                align="center"
                gap="small"
              >
                <CreatePerson createPerson={this.captureName} />
                <Button onClick={this.trainModel} primary label="Train Model" />
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
                  updatePersonsList={this.updatePersonsList}
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
