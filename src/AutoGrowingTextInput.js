
import React, {Component, PropTypes} from 'react';

import {
  View,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  NativeModules,
  Platform,
  Text
} from 'react-native';

var AutoGrowTextInputManager = NativeModules.AutoGrowTextInputManager;

const DEFAULT_ANIM_DURATION = 100;

export default class AutoGrowingTextInput extends React.Component {
  constructor(props) {
    super(props);
  
    // using a JS fix for "onChange" not received on Android when the text is set pragmatically and not by the user
    // a hidden Text is used to measure the height in case it's received via the value prop
    this.state = {height: this._getValidHeight(props.initialHeight),
                  androidHacksHiddenText: props.value || '',
                  androidHacksSetHeightFromHiddenLayout: true};
    
    // using a native fix for "onChange" not received on iOS when the text is set pragmatically and not by the user
    // (https://github.com/wix/react-native-autogrow-textinput/issues/1)
    if(AutoGrowTextInputManager) {
      AutoGrowTextInputManager.setupNotifyChangeOnSetText();
    }
  }
  
  componentWillReceiveProps(props) {
    if(Platform.OS === 'android') {
      this._handleAndroidHackProps(props);
    }
  }
  
  _renderAutoGrowingTextInput() {
    return (
      <TextInput multiline={true}
                 {...this.props} {...this.style}
                 style={[this.props.style, {height: this._getValidHeight(this.state.height)}]}
                 onChange={(event) => {
                   this._onChangeNativeEvent(event.nativeEvent);
                   if (this.props.onChange) {
                     this.props.onChange(event);
                   }
                 }}
                 ref={(r) => { this._textInput = r; }}
      />
    );
  }
  
  render() {
    if(Platform.OS === 'ios') {
      return this._renderAutoGrowingTextInput();
    } else {
      return this._renderAutoGrowingTextInputAndroidHack();
    }
  }

  _getValidHeight(height) {
    const minCappedHeight = Math.max(this.props.minHeight, height);
    if(this.props.maxHeight == null) {
      return minCappedHeight;
    }
    return Math.min(this.props.maxHeight, minCappedHeight);
  }

  _onChangeNativeEvent(nativeEvent) {
    let newHeight = this.state.height;
    if (nativeEvent.contentSize && this.props.autoGrowing) {
      newHeight = nativeEvent.contentSize.height;
      if (this.state.height !== newHeight && newHeight <= this.props.maxHeight && this.props.onHeightChanged) {
        this.props.onHeightChanged(newHeight, this.state.height, newHeight - this.state.height);
      }
    }

    if (this.props.animation.animated) {
      const duration = this.props.animation.duration || DEFAULT_ANIM_DURATION;
      LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut, duration: duration});
    }

    this.setState({
      height: newHeight
    });
  }

  setNativeProps(nativeProps = {}) {
    this._textInput.setNativeProps(nativeProps);
    
    if(Platform.OS === 'android') {
      this._handleAndroidHackProps({value: nativeProps.text}, true);
    }
  }

  resetHeightToMin() {
    this.setState({
      height: this.props.minHeight
    });
  }

  clear() {
    return this._textInput.clear();
  }

  focus() {
    return this._textInput.focus();
  }

  isFocused() {
    return this._textInput.isFocused();
  }
  
  /*
     Android Hacks
   */
  
  _resetAndroidHacks(text = '') {
    this.setState({androidHacksHiddenText: text, androidHacksSetHeightFromHiddenLayout: true});
  }
  
  _handleAndroidHackProps(props, forceUpdate = false) {
    if(!props.value) {
      this._resetAndroidHacks();
    } else if(this.state.androidHacksHiddenText !== props.value && (this.state.androidHacksSetHeightFromHiddenLayout || forceUpdate)) {
      this.setState({androidHacksHiddenText: props.value, androidHacksSetHeightFromHiddenLayout: true});
    }
  }
  
  _renderAutoGrowingTextInputAndroidHack() {
    return (
      <View style={{flex: 1}}>
        <TextInput multiline={true}
                   {...this.props} {...this.style}
                   style={[this.props.style, {height: this._getValidHeight(this.state.height)}]}
                   onChange={(event) => {
                     if(this.state.androidHacksSetHeightFromHiddenLayout) {
                       this.setState({androidHacksHiddenText: event.nativeEvent.text});
                     } else {
                       this._onChangeNativeEvent(event.nativeEvent);
                       if (this.props.onChange) {
                         this.props.onChange(event);
                       }
                     }
                   }}
                   ref={(r) => { this._textInput = r; }}
        />
        <Text style={[this.props.style, styles.hiddenOffScreen]}
              onLayout={(event) => {
                if(this.state.androidHacksSetHeightFromHiddenLayout) {
                  event.nativeEvent = {contentSize: {height: event.nativeEvent.layout.height, width: event.nativeEvent.layout.width}, text: this.state.androidHacksHiddenText};
                  this._onChangeNativeEvent(event.nativeEvent);
                  if (this.props.onChange) {
                    this.props.onChange(event);
                  }
                  this.setState({androidHacksSetHeightFromHiddenLayout: false});
                }
              }}>
          {this.state.androidHacksHiddenText}
        </Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  hiddenOffScreen: {
    position: 'absolute',
    top: 5000,
    left: 5000,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: 'transparent'
  }
});

AutoGrowingTextInput.propTypes = {
  autoGrowing: PropTypes.bool,
  initialHeight: PropTypes.number,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  onHeightChanged: PropTypes.func,
  onChange: PropTypes.func,
  animation: PropTypes.object
};
AutoGrowingTextInput.defaultProps = {
  autoGrowing: true,
  minHeight: 35,
  initialHeight: 35,
  maxHeight: null,
  animation: {animated: false, duration: DEFAULT_ANIM_DURATION}
};
