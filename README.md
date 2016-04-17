# react-native-autogrow-textinput
A helper component meant to be used as a drop-in replacement for RN TextInput to allow automatic expanding of a multi-line text input according to the number of lines

## Installation

Install using `npm`:
```
npm i react-native-autogrow-textinput --save
```

## How To Use
Import the new component:

```js
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
```

Now use it as you would normally do with a `ScrollView` to wrap arround TextInput components:

```jsx
<AutoGrowingTextInput style={styles.textInput} placeholder={'Your Message'} />
```

## Example Project

Check out the full example project [here](https://github.com/wix/react-native-autogrow-textinput/tree/master/example).

In the example folder, perform `npm install` and then run it from the Xcode project.
