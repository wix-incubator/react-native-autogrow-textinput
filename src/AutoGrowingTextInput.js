
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
                   style={[this.props.style, {height: Math.min(this.props.maxHeight, Math.max(this.props.minHeight, this.state.height))}]}
                   multiline={true}
                   onChange={(event) => this._onChangeNativeEvent(event.nativeEvent)}
                   value={this.state.text}
        />
    );
  }

  _onChangeNativeEvent(nativeEvent) {
    let newHeight = this.state.height;
    if(nativeEvent.contentSize && this.props.autoGrowing) {
      newHeight = nativeEvent.contentSize.height;
    }
    this.setState({
      text: nativeEvent.text,
      height: newHeight
    });
  }
}

AutoGrowingTextInput.propTypes = {
  autoGrowing: PropTypes.bool,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number
};
AutoGrowingTextInput.defaultProps = {
  autoGrowing: true,
  minHeight: 35,
  maxHeight: 200
};
