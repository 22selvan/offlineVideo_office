import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VideoSceen = ({ navigation }) => {
  const videoRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [uril, setUri] = useState('https://www.w3schools.com/html/mov_bbb.mp4');



  const downloadVideo = async (videoUri, userId) => {
    try {
      const crn = await AsyncStorage.getItem("CRN");
      if (!crn) {
        throw new Error('CRN not found in AsyncStorage');
      }
  
      // Define a unique file path for the downloaded video
      const fileUri = FileSystem.documentDirectory + `video_${crn}.mp4`;
  
      // Download the video and save it to the fileUri
      const { uri } = await FileSystem.downloadAsync(videoUri, fileUri);
  
      // Store the file URI in AsyncStorage with the CRN key
      await AsyncStorage.setItem(`video_${crn}`, uri);
  
      alert('Video downloaded successfully!');
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video');
    }
  };
  


  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);
    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const handleOrientationChange = (event) => {
    const orientation = event.orientationInfo.orientation;
    if (orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
      setIsFullScreen(true);
      navigation.setOptions({ tabBarVisible: false, headerShown: false });
    } else if (orientation === ScreenOrientation.Orientation.PORTRAIT_UP) {
      setIsFullScreen(false);
      navigation.setOptions({ tabBarVisible: true, headerShown: true });
    }
  };

  const handleFullScreenToggle = async () => {
    if (isFullScreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleDownload = async () => {

    await downloadVideo(uril);
    //await downloadVideo(videoUri, userId);
  };

  // Reset orientation to portrait when the screen is unfocused
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  return (
    <View style={isFullScreen ? styles.fullScreenContainer : styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: uril }}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        useNativeControls
      />
      <TouchableOpacity style={styles.fullScreenButton} onPress={handleFullScreenToggle}>
      <Icon name={isFullScreen ? "fullscreen-exit" : "fullscreen"} size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Icon name="file-download" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: width* (16 / 9),
    height: width * (9 / 16),
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullScreenButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
});

export default VideoSceen;
