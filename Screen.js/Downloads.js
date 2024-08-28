import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';

const Downloads = ({ navigation }) => {
  const [videoList, setVideoList] = useState([]);
  const [audioList, setAudioList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      const crn = await AsyncStorage.getItem("CRN");
      if (crn) {
        const videoUri = await AsyncStorage.getItem(`video_${crn}`);
        const audioUri = await AsyncStorage.getItem(`audio_${crn}`);
        setVideoList(videoUri ? [videoUri] : []);
        setAudioList(audioUri ? [audioUri] : []);
      } else {
        Alert.alert('No CRN found', 'CRN is missing.');
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handlePlay = (type) => {
    const screen = type === "video" ? "playvideo" : "PlayAudio";
    const dataList = type === "video" ? videoList : audioList;

    if (dataList.length > 0) {
      navigation.navigate(screen, { dataList });
    } else {
      Alert.alert(`${type.charAt(0).toUpperCase() + type.slice(1)} Not Available`);
    }
  };

  const handleDelete = async (type) => {
    try {
      const crn = await AsyncStorage.getItem("CRN");
      if (crn) {
        if (type === 'video') {
          setVideoList([]);
          await AsyncStorage.removeItem(`video_${crn}`);
        } else if (type === 'audio') {
          setAudioList([]);
          await AsyncStorage.removeItem(`audio_${crn}`);
        }
        Alert.alert('Deleted', 'The file has been deleted.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {videoList.length === 0 && audioList.length === 0 ? (
            <Text>No files available</Text>
          ) : (
            <>
              {videoList.length > 0 ? (
                <View style={styles.fileContainer}>
                  <TouchableOpacity onPress={() => handlePlay("video")} style={styles.playButton}>
                    <Icon name="play" size={24} color="#fff" />
                    <Text style={styles.playButtonText}>Play Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete("video")} style={styles.deleteButton}>
                    <Icon name="trash-2" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : ""}
              {audioList.length > 0 ? (
                <View style={styles.fileContainer}>
                  <TouchableOpacity onPress={() => handlePlay("audio")} style={styles.playButton}>
                    <Icon name="play" size={24} color="#fff" />
                    <Text style={styles.playButtonText}>Play Audio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete("audio")} style={styles.deleteButton}>
                    <Icon name="trash-2" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : ""}
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fileContainer: {
    width: 300,
    marginTop: 10,
    justifyContent: "space-between",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  playButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});

export default Downloads;
