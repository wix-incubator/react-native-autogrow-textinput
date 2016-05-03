
import React, {
  View,
  TextInput,
  StyleSheet,
  PropTypes,
  LayoutAnimation,
} from 'react-native';

const DEFAULT_ANIM_DURATION = 100;

export default class AutoGrowingTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {height: 0};
  }

  componentWillReceiveProps(newProps) {
    if (newProps.hasOwnProperty('value') && !newProps.value) {
      this.resetHeightToMin();
    }
  }

  render() {
    return (
      <TextInput multiline={true}
        {...this.props} {...this.style}
                 style={[this.props.style, {height: Math.min(this.props.maxHeight, Math.max(this.props.minHeight, this.state.height))}]}
                 onChange={(event) => this._onChangeNativeEvent(event.nativeEvent)}
                 ref={(r) => { this._textInput = r; }}
      />
    );
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
      const duration = this.props.animation.duration | DEFAULT_ANIM_DURATION;
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
}

AutoGrowingTextInput.propTypes = {
  autoGrowing: PropTypes.bool,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  onHeightChanged: PropTypes.func,
  animation: PropTypes.object
};
AutoGrowingTextInput.defaultProps = {
  autoGrowing: true,
  minHeight: 35,
  maxHeight: 200,
  animation: {animated: false, duration: DEFAULT_ANIM_DURATION}
};
