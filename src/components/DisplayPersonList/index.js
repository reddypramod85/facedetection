import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
  Button,
} from 'grommet';
import PropTypes from 'prop-types';
import { addImage, deletePerson, getPersonList } from '../../utill';

export class DisplayPersonList extends Component {
  delete = async (personID, index, name) => {
    const status = await deletePerson(personID);
    if (status === 200) {
      let UpdatedPersonList = this.props.personList;
      UpdatedPersonList.splice(index, 1);
      this.props.updatePersonsList(UpdatedPersonList, name);
    }
  };

  add = async (image, personID, index) => {
    await addImage(image, personID);
    const personList = await getPersonList();
    this.props.updatePersonsList(personList);
  };
  render() {
    const columns = [
      {
        property: 'name',
        label: 'Name',
        dataScope: 'row',
        format: datum => <strong>{datum.name}</strong>,
      },
      {
        property: 'personId',
        label: 'Add Image',
      },
      {
        property: 'personId',
        label: 'Delete Person',
      },
    ];
    return (
      <Table background="light-2" caption="Persons in a Person Group">
        <TableHeader>
          <TableRow>
            {columns.map((c, index) => (
              <TableCell
                key={index}
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
            <TableRow key={datum.personId - index}>
              <>
                <TableCell>
                  <Text>{datum.name}</Text>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      this.add(this.props.image, datum.personId, index);
                    }}
                    primary
                    label="ADD IMAGE"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      this.delete(datum.personId, index, datum.name);
                    }}
                    primary
                    label="DELETE PERSON"
                  />
                </TableCell>
              </>
            </TableRow>
          ))}
          <TableRow />
        </TableBody>
      </Table>
    );
  }
}

// proptypes
DisplayPersonList.propTypes = {
  image: PropTypes.string.isRequired,
  personList: PropTypes.array.isRequired,
  updatePersonsList: PropTypes.func.isRequired,
};
export default DisplayPersonList;
