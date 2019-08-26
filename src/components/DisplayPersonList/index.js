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
import { addImage, deletePerson } from '../../utill';

export class DisplayPersonList extends Component {
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
        label: 'Delete Image',
      },
    ];
    return (
      <Table caption="Simple Table">
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
                      addImage(this.props.image, datum.personId);
                    }}
                    primary
                    label="ADD"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      deletePerson(datum.personId);
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
      </Table>
    );
  }
}

// proptypes
DisplayPersonList.propTypes = {
  image: PropTypes.string.isRequired,
  personList: PropTypes.array.isRequired,
};
export default DisplayPersonList;
