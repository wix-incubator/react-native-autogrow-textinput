import React, {Component} from 'react';
import ReactNative, {View, TextInput, LayoutAnimation, Platform, NativeModules} from 'react-native';
import PropTypes from 'prop-types';

const ANDROID_PLATFORM = (Platform.OS === 'android');
const DEFAULT_ANIM_DURATION = 100;

const AutoGrowTextInputManager = NativeModules.AutoGrowTextInputManager;

export default class AutoGrowingTextInput extends Component {
  constructor(props) {
    super(props);

    this._onChange = this._onChange.bind(this);
    this._onContentSizeChange = this._onContentSizeChange.bind(this);
    this.setNativeProps = this.setNativeProps.bind(this);
  }

  componentDidMount() {
    if(this.shouldApplyNativeSettings()) {
      const reactTag = this.textInputReactTag();
      if (reactTag) {
        AutoGrowTextInputManager.applySettingsForInput(reactTag, {
          disableScrollAndBounce: this.props.disableScrollAndBounceIOS,
          enableScrollToCaret: this.props.enableScrollToCaret,
          maxHeight: this.props.maxHeight
        });
      }
    }
  }

  componentWillUnmount() {
    if(this.shouldApplyNativeSettings()) {
      const reactTag = this.textInputReactTag();
      if (reactTag) {
        AutoGrowTextInputManager.performCleanupForInput(reactTag);
      }
    }
  }

  shouldApplyNativeSettings() {
    return AutoGrowTextInputManager && (ANDROID_PLATFORM || this.props.disableScrollAndBounceIOS || this.props.enableScrollToCaret);
  }

  textInputReactTag() {
    if (this._textInput) {
      return ReactNative.findNodeHandle(this._textInput);
    }
  }

  _renderTextInputAndroid() {
    return (
      <View style={{flex: 1, flexDirection: 'row'}}>
        <TextInput
          multiline={true}
          {...this.props} {...this.style}
          style={this.props.style}
          onContentSizeChange={this._onContentSizeChange}
          onChange={this._onChange}
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
        onContentSizeChange={this._onContentSizeChange}
        onChange={this._onChange}
        ref={(r) => { this._textInput = r; }}
      />
    );
  }

  render() {
    return ANDROID_PLATFORM ? this._renderTextInputAndroid() : this._renderTextInputIOS();
  }

  _onChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  _onContentSizeChange(event) {
    if(this.props.onContentSizeChange) {
      this.props.onContentSizeChange(event);
    }
  }

  _getValidHeight(height) {
    const minCappedHeight = Math.max(this.props.minHeight, height);
    if(this.props.maxHeight == null) {
      return minCappedHeight;
    }
    return Math.min(this.props.maxHeight, minCappedHeight);
  }

  setNativeProps(nativeProps = {}) {
    this._textInput.setNativeProps(nativeProps);
  }

  resetHeightToMin() {
    this.setNativeProps({text: ''});
  }

  clear() {
    if (ANDROID_PLATFORM) {
      // fix for predictive text issues can be removed once https://github.com/facebook/react-native/pull/12462 is merged
      AutoGrowTextInputManager.resetKeyboardInput(ReactNative.findNodeHandle(this._textInput))
    }
    return this._textInput.clear();
  }

  focus() {
    return this._textInput.focus();
  }

  blur() {
    this._textInput.blur();
  }

  isFocused() {
    return this._textInput.isFocused();
  }

  getRef() {
    return this._textInput;
  }
}

AutoGrowingTextInput.propTypes = {
  autoGrowing: PropTypes.bool,
  initialHeight: PropTypes.number,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  onHeightChanged: PropTypes.func,
  onChange: PropTypes.func,
  animation: PropTypes.object,
  disableScrollAndBounceIOS: PropTypes.bool,
  enableScrollToCaret: PropTypes.bool,
};
AutoGrowingTextInput.defaultProps = {
  autoGrowing: true,
  minHeight: 35,
  initialHeight: 35,
  maxHeight: null,
  animation: {animated: false, duration: DEFAULT_ANIM_DURATION},
  disableScrollAndBounceIOS: false,
  enableScrollToCaret: false,
};
