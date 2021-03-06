import dataUriToBuffer from 'data-uri-to-buffer';
import dataURLtoBlob from 'dataurl-to-blob';

// base URL for Azure Face API
const baseUrl = 'https://azure-faceapi.cognitiveservices.azure.com/face/v1.0';

// Azure face api subscription key
const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;

// A person group is a container holding the uploaded person data, including face recognition features
const personGroupName = process.env.REACT_APP_PERSON_GROUP_NAME;

// Current camera Image URL
const cameraImageUrl = process.env.REACT_APP_CAMERA_IMAGE_URL;

// adding face detect attributes
const addImageParams =
  'returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup,accessories,headPose';

// URI for face Detection
const detectUri = `${baseUrl}/detect?${addImageParams}`;

// URI to create a person group mentioned in .env file
const personGroupUri = `${baseUrl}/persongroups/${personGroupName}?`;

// URI to create a new person in a specified person group
const personUri = `${baseUrl}/persongroups/${personGroupName}/persons`;

// URI for face Identify
const identifyUril = `${baseUrl}/identify?`;

// URI for list of persons in a person group
const getPersonsUri = `${baseUrl}/persongroups/${personGroupName}/persons?`;

// create a person group
async function createPersonGroup() {
  const personGroup = await fetch(personGroupUri, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    body: JSON.stringify({
      name: personGroupName,
    }),
  }).catch(err => {
    console.log('err', err);
  });
  const pGroup = await personGroup.json();
  return pGroup;
}

// create a new person in a specified person group
async function createPerson(personName) {
  const person = await fetch(personUri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    body: JSON.stringify({
      name: personName,
    }),
  }).catch(err => {
    console.log('err', err);
  });
  const personResponse = await person.json();
  return personResponse;
}

// CLear, create and save the person list
function savePersonList(data) {
  const personList = [];
  /* for (let i = 0; i < data.length; i++) {
    personList.push({ name: data[i].name, personId: data[i].personId });
  } */
  data.map(d => personList.push({ name: d.name, personId: d.personId }));
  return personList;
}

// API call to get the list of all persons in the current person group
async function getPersonList() {
  const personList = await fetch(getPersonsUri, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
  }).catch(err => {
    console.log('err', err);
  });
  const pList = await personList.json();
  const prsnList = await savePersonList(pList);
  return prsnList;
}

// API call to Detect human faces in an image, return face rectangles, and optionally with faceIds,
// landmarks, and attributes
async function fetchFaceEntries(imageData) {
  const blob = await dataURLtoBlob(imageData);
  const faceDetect = await fetch(detectUri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    body: blob,
  }).catch(err => {
    console.log('err', err);
  });
  return faceDetect;
}

// create faceId array from the list of detected persons
function fetchfaceIds(body) {
  const faceIds = body.map(person => person.faceId);
  return faceIds;
}

// Call this after detecting faces, with face IDs,
// to identify the faces from the people group
async function identifyFaceFromGroup(faceIdsArray, personGroupId) {
  const res = await fetch(identifyUril, {
    method: 'POST',
    body: JSON.stringify({
      faceIds: faceIdsArray,
      personGroupId,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    credentials: 'same-origin',
  }).catch(err => {
    console.log('err', err);
  });
  return res;
}

async function identifyFaceResponse(faceIdsArray) {
  const identifyFaceRes = await identifyFaceFromGroup(
    faceIdsArray,
    personGroupName,
  ).catch(err => {
    console.log('err', err);
  });
  return identifyFaceRes;
}

// Get the face location rectangle coordinate/size information
function faceRects(data) {
  const faceRectsArray = [];
  data.map(faceEntry => {
    const faceRect = faceEntry.faceRectangle;
    faceRectsArray.push({
      left: faceRect.left,
      top: faceRect.top,
      width: faceRect.width,
      height: faceRect.height,
    });
    // this.setState({ faceRects: faceRectsArray });
    return null;
  });
  return faceRectsArray;
}

// function to get person name from the person ID
const getNameFromId = (personId, personList) => {
  let personName;
  personList.map(person => {
    if (person.personId === personId) personName = personList[0].name;
    return null;
  });
  return personName;
};

// return facial emotions
function emotions(faceAttributes) {
  let faceEmotions = '';
  // Return the most confident emotion
  faceEmotions = Object.keys(faceAttributes.emotion).reduce((a, b) => {
    return faceAttributes.emotion[a] > faceAttributes.emotion[b] ? a : b;
  });
  if (faceEmotions === '') {
    faceEmotions = 'unclear';
  }
  return faceEmotions;
}

// return person hair color
function hair(faceAttributes) {
  let personHair = '';
  // Return the most confident hair color
  if (faceAttributes.hair.invisible) personHair = 'unclear';
  else if (faceAttributes.hair.bald > 0.7) personHair = 'bald';
  // Microsoft returns the hair color in an array in order of confidence
  else {
    personHair = faceAttributes.hair.hairColor[0].color;
  }
  return personHair;
}
// Save and display the face data
function displayData(candidatePersons, personList, faceEntries) {
  let name;
  let confidence;
  let eyeMakeUp;
  let lipMakeUp;
  const faceDataArray = [];
  faceEntries.map((faceEntry, index) => {
    if (candidatePersons[index].candidates[0] != null) {
      name = getNameFromId(
        candidatePersons[index].candidates[0].personId,
        personList,
      );
      confidence = parseInt(
        candidatePersons[index].candidates[0].confidence * 100,
        10,
      );
    } else {
      name = 'unknown';
      confidence = 'N/A';
    }
    const { faceAttributes } = faceEntry;
    const gender = faceAttributes.gender.toString();
    const { age } = faceAttributes;
    const smile = (parseFloat(faceAttributes.smile) * 100).toFixed(1);
    const { glasses } = faceAttributes;

    const emotion = emotions(faceAttributes);
    const hairs = hair(faceAttributes);
    if (faceAttributes.makeup.eyeMakeup) eyeMakeUp = 'Yes';
    else eyeMakeUp = 'No';
    if (faceAttributes.makeup.lipMakeup) lipMakeUp = 'Yes';
    else lipMakeUp = 'No';

    faceDataArray.push({
      name,
      confidence,
      gender,
      age,
      smile,
      emotion,
      hairs,
      glasses,
      eyeMakeUp,
      lipMakeUp,
    });
    return null;
  });
  return faceDataArray;
}

// API call to add the current face image to a specific person
async function addImage(imageSrc, personId) {
  const addImageUrl = `${baseUrl}/persongroups/${personGroupName}/persons/${personId}/persistedFaces?`;
  const buff = await dataUriToBuffer(imageSrc);
  await fetch(`${addImageUrl}${addImageParams}`, {
    method: 'POST',
    body: buff,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    credentials: 'same-origin',
  });
}

// API call to delete a saved person by their person ID
async function deletePerson(personId) {
  const deleteImage = `${baseUrl}/persongroups/${personGroupName}/persons/${personId}?`;
  await fetch(deleteImage, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
  });
}

//  create a base64 encoded ASCII string from a string of binary data
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
}

// API call to fetch the current image from the network camera
async function getCameraImage() {
  const cameraImage = await fetch(cameraImageUrl, {
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
      return image;
    });
  });
  return cameraImage;
}

async function resizeImage(image, callback) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  // canvas.height = canvas.width * (image.height / image.width);
  canvas.height = 400;
  const img = new Image();
  let data = 'pramod';

  img.onload = await function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    data = canvas.toDataURL('image/jpeg');
    callback(data);
  };

  // SEND THIS DATA TO WHEREVER YOU NEED IT
  img.src = image;
}

export {
  createPersonGroup,
  createPerson,
  identifyFaceFromGroup,
  fetchFaceEntries,
  getPersonList,
  getNameFromId,
  faceRects,
  displayData,
  identifyFaceResponse,
  fetchfaceIds,
  addImage,
  deletePerson,
  arrayBufferToBase64,
  getCameraImage,
  resizeImage,
};
