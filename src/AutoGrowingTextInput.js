
import React, {Component, PropTypes} from 'react';

import {
  View,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  Platform,
} from 'react-native';

const ANDROID_PLATFORM = (Platform.OS === 'android');

const DEFAULT_ANIM_DURATION = 100;

export default class AutoGrowingTextInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: this._getValidHeight(props.initialHeight),
      androidFirstContentSizeChange: true
    };
  }

  _renderTextInput() {
    return (
      <TextInput
        multiline={true}
        {...this.props} {...this.style}
        style={[this.props.style, {height: this._getValidHeight(this.state.height)}]}
        onContentSizeChange={(event) => this._onContentSizeChange(event)}
        onChange={(event) => this._onChange(event)}
        ref={(r) => { this._textInput = r; }}
      />
    );
  }

  render() {
    if(ANDROID_PLATFORM) {
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            { this._renderTextInput() }
          </View>
        </View>
      );
    } else {
      return this._renderTextInput();
    }
  }

  /*
   TextInput onContentSizeChange should fix the issue with "initial value doesn't receive change event"
   While this works perfectly on iOS, on Android you only get it on the first time the component is displayed..
   So on Android a height update for the initial value is performed in `onContentSizeChange`, but the rest
   of the updates are still performed via `onChange` as it was before
   using a flag (androidFirstContentSizeChange) to pervent multiple updates in case both notifications works simultaniously in some cases
   */
  _onContentSizeChange(event) {
    if(ANDROID_PLATFORM) {
      if(!this.state.androidFirstContentSizeChange) {
        return;
      }
      this.setState({androidFirstContentSizeChange: false});
    }
    this._handleNativeEvent(event.nativeEvent);

    if (this.props.onContentSizeChange) {
      this.props.onContentSizeChange(event);
    }
  }

  _onChange(event) {
    if(ANDROID_PLATFORM && !this.state.androidFirstContentSizeChange) {
      this._handleNativeEvent(event.nativeEvent);
    }
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  _getValidHeight(height) {
    const minCappedHeight = Math.max(this.props.minHeight, height);
    if(this.props.maxHeight == null) {
      return minCappedHeight;
    }
    return Math.min(this.props.maxHeight, minCappedHeight);
  }

  _handleNativeEvent(nativeEvent) {
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
