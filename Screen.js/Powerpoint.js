// import React from 'react';
// import { View, Button, Alert } from 'react-native';
// import * as FileSystem from 'expo-file-system';
// import * as IntentLauncher from 'expo-intent-launcher';

// const downloadPPT = async (url) => {
//   try {
//     const downloadResumable = FileSystem.createDownloadResumable(
//       url,
//       FileSystem.documentDirectory + 'example.pptx'
//     );

//     const { uri } = await downloadResumable.downloadAsync();
//     return uri;
//   } catch (error) {
//     Alert.alert('Error', 'Failed to download the PPT file.');
//     console.error(error);
//   }
// };


// export default function Powerpoint() {
//   const handleDownloadAndView = async () => {
//     const pptUri = await downloadPPT('https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt');

//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Button title="Download and View PPT" onPress={handleDownloadAndView} />
//     </View>
//   );
// }

import React from 'react';
import { View, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const downloadPPT = async (url) => {
  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      FileSystem.documentDirectory + 'example.pptx'
    );

    const { uri } = await downloadResumable.downloadAsync();
    return uri;
  } catch (error) {
    Alert.alert('Error', 'Failed to download the PPT file.');
    console.error(error);
  }
};

const openPPT = async (uri) => {
  try {
    const cUri = uri.replace('file://', ''); // Ensure URI format is correct
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: cUri,
      flags: 1,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
  } catch (error) {
    Alert.alert('Error', 'No app found to open the PPT file.');
    console.error(error);
  }
};

export default function Powerpoint() {
  const handleDownloadAndView = async () => {
    const pptUri = await downloadPPT('https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt');
    if (pptUri) {
      openPPT(pptUri);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Download and View PPT" onPress={handleDownloadAndView} />
    </View>
  );
}

