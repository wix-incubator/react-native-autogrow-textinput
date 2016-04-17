/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';

class example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Auto Growing TextInput Example
        </Text>
        <AutoGrowingTextInput style={styles.textInput} placeholder={'Your Message'} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#76c6ff'
  },
  welcome: {
    marginTop: 100,
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  textInput: {
    height: 35,
    margin: 10,
    paddingLeft: 10,
    fontSize: 17,
    lineHeight: 35,
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: 4
  }
});

AppRegistry.registerComponent('example', () => example);
