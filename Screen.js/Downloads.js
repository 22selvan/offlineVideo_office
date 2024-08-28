import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';

const Downloads = ({ navigation }) => {
  const [videoList, setVideoList] = useState({key:"",videoUri:""});
  const [audioList, setAudioList] = useState({key:"",audioUri:""});
  const [loading, setLoading] = useState(true);
  console.log('====================================');
  console.log(videoList,audioList);
  console.log('====================================');

  const loadFiles = async () => {
    try {
      const crn = await AsyncStorage.getItem("CRN");
      if (crn) {
        const videoUri = await AsyncStorage.getItem(`video_${crn}`);
        const audioUri = await AsyncStorage.getItem(`audio_${crn}`);
        setVideoList([{key:crn,videoUri:videoUri}]);
        setAudioList([{key:crn,audioUri:audioUri}]);
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
    const uri = type === "video" ? videoList : audioList;

    if (uri.length > 0) {
      navigation.navigate(screen, { uri });
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
          {videoList.length === 0 && audioList.length === 0  ? videoList[0].videoUri === null &&
           videoList[0].audioUri === null ?  <Text>No files available</Text> : (
            <Text>No files available</Text>
          ) : (
            <>
              {videoList.length > 0 && videoList[0].videoUri !== null ? (
                <View style={styles.fileContainer}>
                  <TouchableOpacity onPress={() => handlePlay("video")} style={styles.playButton}>
                    <Icon name="play" size={24} color="#fff" />
                    <Text style={styles.playButtonText}>Play Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete("video")} style={styles.deleteButton}>
                    <Icon name="trash-2" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) :  <Text>No Video files available</Text>}
              {audioList.length > 0 && audioList[0].audioUri !== null ? (
                <View style={styles.fileContainer}>
                  <TouchableOpacity onPress={() => handlePlay("audio")} style={styles.playButton}>
                    <Icon name="play" size={24} color="#fff" />
                    <Text style={styles.playButtonText}>Play Audio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete("audio")} style={styles.deleteButton}>
                    <Icon name="trash-2" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) :  <Text>No Audio files available</Text>}
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
