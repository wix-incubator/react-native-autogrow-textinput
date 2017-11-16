import React, {Component} from 'react';
import {AppRegistry, StyleSheet, Text, View, TouchableOpacity, Platform} from 'react-native';

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';

class example extends Component {
  constructor(props) {
    super(props);
    this.state = {textValue: 'My initial\nText'};
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Auto Growing TextInput Example
        </Text>
        <View style={styles.textInputContainer}>
          <AutoGrowingTextInput
            value={this.state.textValue}
            onChange={(event) => this._onChange(event)}
            style={styles.textInput}
            placeholder={'Your Message'}
            placeholderTextColor='#66737C'
            maxHeight={200}
            minHeight={45}
            enableScrollToCaret
            ref={(r) => { this._textInput = r; }}
          />
          <TouchableOpacity style={styles.button} onPress={() => this._resetTextInput()}>
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _onChange(event) {
    this.setState({ textValue: event.nativeEvent.text || '' });
  }

  _resetTextInput() {
    this._textInput.clear();
    this._textInput.resetHeightToMin();
  }
}

const IsIOS = Platform.OS === 'ios';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#76c6ff'
  },
  textInputContainer: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 8
  },
  welcome: {
    marginTop: 100,
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  textInput: {
    paddingLeft: 10,
    fontSize: 17,
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: IsIOS ? 4 : 0,
  },
  button: {
    paddingLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

AppRegistry.registerComponent('example', () => example);
