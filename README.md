# react-native-autogrow-textinput
A helper component meant to be used as a drop-in replacement for RN TextInput to allow automatic expanding of a multi-line text input according to the number of lines.

![Demo](http://i.imgur.com/ZVhZ7r5.gif)

## Installation

Install using `npm`:
```
npm i react-native-autogrow-textinput --save
```

#### Native side installation

To fix the [issue](https://github.com/wix/react-native-autogrow-textinput/issues/1) with the height not being set for initial values (or with other cases where the input is not set by the user typing using the keyboard) you need to add the `libAutoGrowTextInput` to your project. After performing `npm install`, locate `AutoGrowTextInput.xcodeproj` in `YOUR_PROJECT/node_modules/react-native-autogrow-textinput/ios` and drag it to your own project, then in your target's general settings, add it to the "Linked Frameworks and Libraries".

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
