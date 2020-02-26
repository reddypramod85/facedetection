import React, { Component } from 'react';
import { Button, TextInput } from 'grommet';
import PropTypes from 'prop-types';

export class CreatePerson extends Component {
  state = { name: '' };

  captureName = async () => {
    console.log('inside cappture name index.js');
    this.props.createPerson(this.state.name);
  };

  render() {
    const { name } = this.state;
    return (
      <>
        <TextInput
          placeholder="type person name here"
          value={name}
          onChange={event => this.setState({ name: event.target.value })}
        />
        <Button onClick={this.captureName} primary label="Create Person" />
      </>
    );
  }
}

// proptypes
CreatePerson.propTypes = {
  createPerson: PropTypes.func.isRequired,
};

export default CreatePerson;
