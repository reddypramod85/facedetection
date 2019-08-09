import React from "react";
import { Grommet, Box, Button, Form } from "grommet";
import { grommet } from "grommet/themes";
import "./App.css";
import Webcam from "react-webcam";
import Header from "./components/Layout/Header";
import DisplayFaceData from "./components/DisplayFaceData/DisplayFaceData";
import { dataURItoBuffer } from "./utill";
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
    personList: []
  };
  setRef = webcam => {
    this.webcam = webcam;
  };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ faceRects: [] });
    const personGroupName = "hpe";

    //capture the image
    const imageSrc = this.webcam.getScreenshot();
    this.setState({
      imageData: imageSrc
    });

    // Azure face api subscription key
    //const subscriptionKey = "27e14365dc7f49eeb8a6000bd44c53fe";
    const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;
    console.log("subscriptionKey", subscriptionKey);
    /* const imageUrl =
      "https://upload.wikimedia.org/wikipedia/commons/3/37/Dagestani_man_and_woman.jpg"; */

    // URI for face detect
    /*     const params_Detect = {
      returnFaceId: "true",
      returnFaceLandmarks: "false",
      returnFaceAttributes:
        "age,gender,headPose,smile,facialHair,glasses," +
        "emotion,hair,makeup,occlusion,accessories,blur,exposure,noise"
    }; */
    const uri_Detect =
      "https://azure-faceapi.cognitiveservices.azure.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair";

    const uri_getPersons =
      "https://azure-faceapi.cognitiveservices.azure.com/face/v1.0/persongroups/" +
      personGroupName +
      "/persons?";

    // URI for face Identify
    const uri_Identify =
      "https://azure-faceapi.cognitiveservices.azure.com/face/v1.0/identify?";

    // API call to get the list of all persons in the current person group

    const getPersonList = await fetch(uri_getPersons, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey
      }
    });

    this.setState({ personList: await getPersonList.json() });
    console.log("savedPersonList", this.state.personList);

    const getNameFromId = personId => {
      let personName;
      console.log("getNameFromId personId", personId);
      this.state.personList.map((person, index) => {
        if (person.personId === personId)
          personName = this.state.personList[0].name;
        return null;
      });
      return personName;
    };

    const fetchFaceEntries = await fetch(uri_Detect, {
      method: "POST",
      body: await dataURItoBuffer(imageSrc),
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": subscriptionKey
      },
      credentials: "same-origin"
    }).catch(err => {
      alert(err);
      console.log("err", err);
    });

    const faceEntries = await fetchFaceEntries.json();
    console.log("faceEntries", faceEntries);

    const fetchfaceIds = async body => {
      let faceIds = body.map(person => person.faceId);
      return faceIds;
      //identifyFaceFromGroup(faceIds);
    };

    const faceIdsArray = await fetchfaceIds(faceEntries);
    console.log("faceIdsArray", faceIdsArray);

    // Call this after detecting faces, with face IDs,
    // to identify the faces from the people group
    const identifyFaceFromGroup = async (faceIdsArray, personGroupName) => {
      const res = await fetch(uri_Identify, {
        method: "POST",
        body: JSON.stringify({
          faceIds: faceIdsArray,
          personGroupId: personGroupName
        }),
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": subscriptionKey
        },
        credentials: "same-origin"
      }).catch(err => {
        alert(err);
        console.log("err", err);
      });
      return res;
    };

    const dentifyFaceResponse = await identifyFaceFromGroup(
      faceIdsArray,
      personGroupName
    ).catch(err => {
      alert(err);
      console.log("err", err);
    });
    const candidatePersons = await dentifyFaceResponse.json();
    console.log("candidatePersons", candidatePersons);

    // Get the face location rectangle coordinate/size information
    const faceRects = data => {
      let faceRectsArray = [];
      for (let i = 0; i < data.length; i++) {
        let faceRect = data[i].faceRectangle;
        faceRectsArray.push({
          left: faceRect.left,
          top: faceRect.top,
          width: faceRect.width,
          height: faceRect.height
        });
      }
      this.setState({ faceRects: faceRectsArray });
      //faceRects = faceRectsArray;
      console.log("getFaceRects", this.state.faceRects);
      //drawImage();
    };
    await faceRects(faceEntries);

    // Save and display the face data
    const displayData = candidatePersons => {
      //var data = this.state.detectFaceData;
      //var faceEntries = faceEntries;
      console.log("inside displayData faceEntries", faceEntries);
      console.log("inside displayData candidatePersons", candidatePersons);
      var name;
      var confidence;
      let faceDataArray = [];
      faceEntries.map((faceEntry, index) => {
        if (candidatePersons[index].candidates[0] != null) {
          console.log("matched");
          name = getNameFromId(candidatePersons[index].candidates[0].personId);
          console.log("my name", name);
          confidence = parseInt(
            candidatePersons[index].candidates[0].confidence * 100
          );
        } else {
          name = "unknown";
          confidence = "N/A";
        }
        var faceAttributes = faceEntry.faceAttributes;
        var gender = faceAttributes.gender.toString();
        var age = faceAttributes.age;
        var smile = (parseFloat(faceAttributes.smile) * 100).toFixed(1);
        var glasses = faceAttributes.glasses;
        var emotions = "";
        // Return the most confident emotion
        emotions = Object.keys(faceAttributes.emotion).reduce(function(a, b) {
          return faceAttributes.emotion[a] > faceAttributes.emotion[b] ? a : b;
        });
        if (emotions === "") {
          emotions = "unclear";
        }
        var hair = "";
        // Return the most confident hair color
        if (faceAttributes.hair.invisible) hair = "unclear";
        else if (faceAttributes.hair.bald > 0.7) hair = "bald";
        // Microsoft returns the hair color in an array in order of confidence
        else {
          hair = faceAttributes.hair.hairColor[0].color;
        }
        faceDataArray.push({
          name: name,
          confidence: confidence,
          gender: gender,
          age: age,
          smile: smile,
          emotions: emotions,
          hair: hair,
          glasses: glasses
        });
        return null;
      });
      this.setState({ faceData: faceDataArray });
      console.log("inside display data", this.state.faceData);
    };

    await displayData(candidatePersons);

    /*     // CLear, create and save the person list
 const savePersonList = (data => {
   console.log("inside savePersonList", data);
  personList = [];
  data.map(person => {
    personList.push([person.name, person.personId])
    return personList
  });
  this.setState({ personList: personList});
 });

//await savePersonList(PersonsList); */

    // API call to add the current face image to a specific person

    //const faceIdsArray = await addPersonFace(this.state.imageData, );
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };

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
              pad="small"
              flex
              direction="row"
              align="center"
              //background={{ color: "light-2", opacity: "strong" }}
              gap="small"
            >
              <Webcam
                audio={false}
                height={350}
                ref={this.setRef}
                screenshotFormat="image/jpeg"
                width={350}
                videoConstraints={videoConstraints}
              />
              <Button type="submit" primary label="Detect Face" />

              {this.state.imageData ? (
                <Box
                  pad="medium"
                  align="center"
                  //background={{ color: "light-2", opacity: "strong" }}
                  gap="small"
                >
                  {this.state.faceRects.length > 0 ? (
                    <Canvas
                      image={this.state.imageData}
                      facer={this.state.faceRects}
                    />
                  ) : null}
                </Box>
              ) : null}
            </Box>
            {this.state.imageData ? (
              <Box pad="medium" align="center" gap="small">
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
