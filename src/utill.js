// Azure face api subscription key
const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;
// A person group is a container holding the uploaded person data, including face recognition features
const personGroupName = process.env.REACT_APP_PERSON_GROUP_NAME;
// URI for face detect
/*
// Encode object to url params string
const serialize = (obj) => {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}; 

const paramsDetect = {
  returnFaceId: "true",
  returnFaceLandmarks: "false",
  returnFaceAttributes:
    "age,gender,headPose,smile,facialHair,glasses," +
    "emotion,hair,makeup,occlusion,accessories,blur,exposure,noise"
};

serialize(paramsDetect);
*/

const apiUrl = 'https://azure-faceapi.cognitiveservices.azure.com/face/v1.0';

// URI for face Detection
const uri_Detect =
  `${apiUrl}/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair`;
// URI for face Identify
const uri_Identify =
  `${apiUrl}/identify?`;

// URI for list of persons in a person group
const uri_getPersons =
  `${apiUrl}/persongroups/${personGroupName}/persons?`;

// Base 64ing image to transmit.
const dataURItoBuffer = async dataURL => {
  const buff = await new Buffer(
    dataURL.replace(/^data:image\/(png|gif|jpeg);base64,/, ""),
    "base64"
  );
  return buff;
};

// Call this after detecting faces, with face IDs,
// to identify the faces from the people group
async function identifyFaceFromGroup(faceIdsArray, personGroupName) {
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
}

// API call to Detect human faces in an image, return face rectangles, and optionally with faceIds,
// landmarks, and attributes
async function fetchFaceEntries(imageData) {
  const buff = await dataURItoBuffer(imageData);
  const faceDetect = await fetch(uri_Detect, {
    method: "POST",
    body: buff,
    headers: {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  }).catch(err => {
    alert(err);
    console.log("err", err);
  });
  return faceDetect;
}

// CLear, create and save the person list
function savePersonList(data) {
  const personList = [];
  for (var i = 0; i < data.length; i++) {
    personList.push({ name: data[i].name, personId: data[i].personId });
  }
  return personList;
}

// API call to get the list of all persons in the current person group
async function getPersonList() {
  const personList = await fetch(uri_getPersons, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  }).catch(err => {
    alert(err);
    console.log("err", err);
  });
  const pList = await personList.json();
  const prsnList = await savePersonList(pList);
  return prsnList;
}

//function to get person name from the person ID
const getNameFromId = (personId, personList) => {
  let personName;
  personList.map((person, index) => {
    if (person.personId === personId) personName = personList[0].name;
    return null;
  });
  return personName;
};

// Do we need async function here?
async function fetchfaceIds(body) {
  let faceIds = body.map(person => person.faceId);
  return faceIds;
}

// Get the face location rectangle coordinate/size information
// Do we need async function here?
async function faceRects(data) {
  let faceRectsArray = [];
  data.map((faceEntry, index) => {
    const faceRect = faceEntry.faceRectangle;
    faceRectsArray.push({
      left: faceRect.left,
      top: faceRect.top,
      width: faceRect.width,
      height: faceRect.height
    });
    //this.setState({ faceRects: faceRectsArray });
    return null;
  });
  return faceRectsArray;
}

// Save and display the face data
// Do we need async function here?
async function displayData(candidatePersons, personList, faceEntries) {
  let name;
  let confidence;
  let faceDataArray = [];
  faceEntries.map((faceEntry, index) => {
    if (candidatePersons[index].candidates[0] != null) {
      name = getNameFromId(
        candidatePersons[index].candidates[0].personId,
        personList
      );
      confidence = parseInt(
        candidatePersons[index].candidates[0].confidence * 100
      );
    } else {
      name = "unknown";
      confidence = "N/A";
    }
    let faceAttributes = faceEntry.faceAttributes;
    let gender = faceAttributes.gender.toString();
    let age = faceAttributes.age;
    let smile = (parseFloat(faceAttributes.smile) * 100).toFixed(1);
    let glasses = faceAttributes.glasses;
    let emotions = "";
    // Return the most confident emotion
    // Arrow function to clean up return
    emotions = Object.keys(faceAttributes.emotion).reduce((a, b) =>
      faceAttributes.emotion[a] > faceAttributes.emotion[b]
        ? a
        : b;
    );
  if (emotions === "") {
    emotions = "unclear";
  }
  let hair = "";
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
return faceDataArray;
}

async function identifyFaceResponse(faceIdsArray) {
  const identifyFaceRes = await identifyFaceFromGroup(
    faceIdsArray,
    personGroupName
  ).catch(err => {
    alert(err);
    console.log("err", err);
  });
  return identifyFaceRes;
}

export {
  dataURItoBuffer,
  identifyFaceFromGroup,
  fetchFaceEntries,
  getPersonList,
  getNameFromId,
  faceRects,
  displayData,
  identifyFaceResponse,
  fetchfaceIds
};
