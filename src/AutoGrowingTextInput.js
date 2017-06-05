import React, {Component, PropTypes} from 'react';
import {View, TextInput, LayoutAnimation, Platform} from 'react-native';

const ANDROID_PLATFORM = (Platform.OS === 'android');
const DEFAULT_ANIM_DURATION = 100;

export default class AutoGrowingTextInput extends Component {
  constructor(props) {
    super(props);

    this._onContentSizeChangeAndroid = this._onContentSizeChangeAndroid.bind(this);
    this._onChangeAndroid = this._onChangeAndroid.bind(this);
    this._onChangeIOS = this._onChangeIOS.bind(this);
    this._onContentSizeChangeIOS = this._onContentSizeChangeIOS.bind(this);

    this.state = {
      height: this._getValidHeight(props.initialHeight),
      androidFirstContentSizeChange: true
    };
  }

  _renderTextInputAndroid() {
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
      <TextInput
        multiline={true}
        {...this.props} {...this.style}
        style={[this.props.style, {height: this._getValidHeight(this.state.height), flex: 1}]}
        onContentSizeChange={this._onContentSizeChangeAndroid}
        onChange={this._onChangeAndroid}
        ref={(r) => { this._textInput = r; }}
      />
      </View>
    );
  }

  _renderTextInputIOS() {
    return (
      <TextInput
        multiline={true}
        {...this.props}
        style={[this.props.style, {height: 'auto'}]}
        onContentSizeChange={this._onContentSizeChangeIOS}
        onChange={this._onChangeIOS}
        ref={(r) => { this._textInput = r; }}
      />
    );
  }

  render() {
    return ANDROID_PLATFORM ? this._renderTextInputAndroid() : this._renderTextInputIOS();
  }

  /*
   TextInput onContentSizeChange should fix the issue with "initial value doesn't receive change event"
   While this works perfectly on iOS, on Android you only get it on the first time the component is displayed..
   So on Android a height update for the initial value is performed in `onContentSizeChange`, but the rest
   of the updates are still performed via `onChange` as it was before
   using a flag (androidFirstContentSizeChange) to pervent multiple updates in case both notifications works simultaniously in some cases
   */
  _onContentSizeChangeAndroid(event) {
    if(this.state.androidFirstContentSizeChange) {
      this.setState({androidFirstContentSizeChange: false});
      this._handleNativeEvent(event.nativeEvent);
    }
    if (this.props.onContentSizeChange) {
      this.props.onContentSizeChange(event);
    }
  }

  _onChangeAndroid(event) {
    if(!this.state.androidFirstContentSizeChange) {
      this._handleNativeEvent(event.nativeEvent);
    }
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  _onContentSizeChangeIOS(event) {
    if(this.props.onContentSizeChange) {
      this.props.onContentSizeChange(event);
    }
  }

  _onChangeIOS(event) {
    this._animateIfNecessary();

    if(this.props.onChange) {
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

  _animateIfNecessary() {
    if (this.props.animation.animated) {
      const duration = this.props.animation.duration || DEFAULT_ANIM_DURATION;
      LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut, duration: duration});
    }
  }

  _handleNativeEvent(nativeEvent) {
    let newHeight = this.state.height;
    if (nativeEvent.contentSize && this.props.autoGrowing) {
      newHeight = nativeEvent.contentSize.height;
      if (this.state.height !== newHeight && newHeight <= this.props.maxHeight && this.props.onHeightChanged) {
        this.props.onHeightChanged(newHeight, this.state.height, newHeight - this.state.height);
      }
    }

    this._animateIfNecessary();
    this.setState({height: newHeight});
  }

  setNativeProps(nativeProps = {}) {
    this._textInput.setNativeProps(nativeProps);
  }

  resetHeightToMin() {
    this.setState({height: this.props.minHeight});
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