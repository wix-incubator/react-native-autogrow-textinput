
import React, {
  View,
  TextInput,
  StyleSheet,
  PropTypes
} from 'react-native';

export default class AutoGrowingTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {text: '', height: 0};
  }
  
  render() {
    return (
        <TextInput {...this.props} {...this.style}
                   style={[this.props.style, {height: Math.max(this.props.minHeight, this.state.height)}]}
                   multiline={true}
                   onChange={(event) => this._onChangeNativeEvent(event.nativeEvent)}
                   value={this.state.text}
        />
    );
  }

  _onChangeNativeEvent(nativeEvent) {
    if(nativeEvent.contentSize) {
      const newHeight = this.props.autoGrowing ? nativeEvent.contentSize.height : this.state.height;
      this.setState({
        text: nativeEvent.text,
        height: newHeight
      });
    }
    else {
      this.setState({
        text: nativeEvent.text
      });
    }
  }
}

AutoGrowingTextInput.propTypes = {
  autoGrowing: PropTypes.bool,
  minHeight: PropTypes.number
};
AutoGrowingTextInput.defaultProps = {
  autoGrowing: true,
  minHeight: 35
};
