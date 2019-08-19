import React, { Component } from "react";
import uuidv1 from "uuid/v1";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
  Text,
  Button
} from "grommet";
import { dataURItoBuffer } from "../../utill";
import PropTypes from "prop-types";

export class DisplayPersonList extends Component {
  generateKey = pre => {
    return `${pre}_${new Date().getTime()}`;
  };
  // API call to add the current face image to a specific person

  // Consider refactoring to your utils.
  addImage = async (imageSrc, personId) => {
    const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;
    const personGroupName = process.env.REACT_APP_PERSON_GROUP_NAME;
    // use util base API variable + template strings.
    const addImage_baseURL =
      "https://azure-faceapi.cognitiveservices.azure.com/face/v1.0/persongroups/" +
      personGroupName +
      "/persons/" +
      personId +
      "/persistedFaces?";
    const addImage_params =
      "returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair";
    await fetch(addImage_baseURL + addImage_params, {
      method: "POST",
      body: await dataURItoBuffer(imageSrc),
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": subscriptionKey
      },
      credentials: "same-origin"
    });
  };

  // API call to delete a saved person by their person ID
  deletePerson = async personId => {
    const subscriptionKey = process.env.REACT_APP_SUBSCRIPTION_KEY;
    const personGroupName = process.env.REACT_APP_PERSON_GROUP_NAME;
    const deleteImage_baseURL =
      "https://azure-faceapi.cognitiveservices.azure.com/face/v1.0/persongroups/" +
      personGroupName +
      "/persons/" +
      personId +
      "?";
    await fetch(deleteImage_baseURL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey
      }
    });
  };

  //call getPersonList
  //getPersonList();

  render() {
    const columns = [
      {
        property: "name",
        label: "Name",
        dataScope: "row",
        format: datum => <strong>{datum.name}</strong>
      },
      {
        property: "personId",
        label: "Add Image"
      },
      {
        property: "personId",
        label: "Delete Image"
      }
    ];
    return (
      <Table caption="Simple Table">
        <TableHeader>
          <TableRow>
            {columns.map(c => (
              <TableCell
                key={uuidv1()}
                scope="col"
                border="bottom"
                align={c.align}
              >
                <Text>{c.label}</Text>
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.props.personList.map((datum, index) => (
            <TableRow key={`${datum.personId}-${index}`}>
              <>
                <TableCell>
                  <Text>{datum.name}</Text>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={e => {
                      this.addImage(this.props.image, datum.personId);
                    }}
                    primary
                    label="ADD"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={e => {
                      this.deletePerson(datum.personId);
                    }}
                    primary
                    label="DELETE"
                  />
                </TableCell>
              </>
            </TableRow>
          ))}
          <TableRow />
        </TableBody>
        <TableFooter>
          <TableRow>
            {columns.map(c => (
              <TableCell key={uuidv1()} border="top" align={c.align}>
                { /* investigate, try to remove uuid library. */}
                <Text>{c.footer}</Text>
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

//proptypes
DisplayPersonList.propTypes = {
  image: PropTypes.string.isRequired,
  personList: PropTypes.array.isRequired
};
export default DisplayPersonList;
