import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ActivityIndicator } from 'react-native';


export default function MusicPlayer() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  

  async function loadAudio() {
    const { sound, status } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { shouldPlay: isPlaying },
      onPlaybackStatusUpdate
    );
    setSound(sound);
    setIsLoaded(true);
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  }

  async function handlePlayPause() {
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  }

  async function handleStop() {
    await sound.stopAsync();
    setIsPlaying(false);
  }

  function handleSliderChange(value) {
    sound.setPositionAsync(value);
  }

  useEffect(() => {
    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const downloadAudio = async (audioUri, userId) => {
    setIsDownloading(true);
    try {
      // Retrieve a unique identifier from AsyncStorage or generate one
      const crn = await AsyncStorage.getItem("CRN");
      if (!crn) {
        throw new Error('CRN not found in AsyncStorage');
      }
  
      // Define a unique file path for the downloaded audio
      const fileUri = FileSystem.documentDirectory + `audio_${crn}.mp3`;
  
      // Download the audio and save it to the fileUri
      const { uri } = await FileSystem.downloadAsync(audioUri, fileUri)
      setIsDownloading(false);
      // Store the file URI in AsyncStorage with the CRN key
      await AsyncStorage.setItem(`audio_${crn}`, uri);
  
      alert('Audio downloaded successfully!');
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Failed to download audio');
    }
  };



  const handleDownload = async () => {

    const audioUri = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Replace with your audio URL
    const userId = 'someUserId'; // Replace with actual user ID if needed
    await downloadAudio(audioUri, userId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>
      {isDownloading && (
        <View style={styles.overlay}>
          <Text style={styles.text}>Downloading...</Text>
          {/* <Progress.Bar progress={downloadProgress} width={200} color="#ffffff" /> */}
          <ActivityIndicator size="large" color="#ffffff" style={styles.indicator} />
        </View>
      )}
      <View style={styles.controls}>
        <Icon
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={40}
          color="#000"
          onPress={handlePlayPause}
          style={styles.icon}
        />
        <Icon
          name="stop"
          size={40}
          color="#000"
          onPress={handleStop}
          style={styles.icon}
        />
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Position: {Math.floor(playbackPosition / 1000)}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={playbackDuration}
          value={playbackPosition}
          onValueChange={handleSliderChange}
          disabled={!isLoaded}
        />
        <Text style={styles.sliderLabel}>Duration: {Math.floor(playbackDuration / 1000)}s</Text>
      </View>
      <Icon
          name="download"
          size={40}
          color="#000"
          onPress={handleDownload}
          style={styles.icon}
  
        />
      {/* <Button title="Download Audio" onPress={handleDownload} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  icon: {
    marginHorizontal: 10,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Ensure the overlay is black
  },
  text: {
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 16,
  },
  indicator: {
    marginTop: 20,
  },
});
