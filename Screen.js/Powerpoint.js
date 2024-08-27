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


export default function Powerpoint() {
  const handleDownloadAndView = async () => {
    const pptUri = await downloadPPT('https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt');

  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Download and View PPT" onPress={handleDownloadAndView} />
    </View>
  );
}
