import React, { Component } from 'react'
import { Box, Text } from 'grommet';

export class DisplayPersonList extends Component {
    render() {
        console.log("Inside Display person list component", this.props.personList);
        return (
            <Box>
               {this.props.personList.map(datum => (
                <Text>{datum.name}</Text>
               ))}
            </Box>
        )
    }
}

export default DisplayPersonList
