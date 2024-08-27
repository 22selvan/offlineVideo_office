import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather'; // Import icons from Feather
import PlayAudio from './playAudio';
import PlayVideo from './playVideo';

const { width } = Dimensions.get('window');

const Downloads = () => {
  const [videoList, setVideoList] = useState([]);
  const [audioList, setAudioList] = useState([]);
  const [playingUri, setPlayingUri] = useState(null);
  const [playbackType, setPlaybackType] = useState(null); // 'audio' or 'video'

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const crn = await AsyncStorage.getItem("CRN");
        if (crn) {
          const allKeys = await AsyncStorage.getAllKeys();
          const videoUris = await Promise.all(
            allKeys
              .filter(key => key.startsWith(`video_${crn}`))
              .map(async key => {
                const uri = await AsyncStorage.getItem(key);
                return { key, uri };
              })
          );
          const audioUris = await Promise.all(
            allKeys
              .filter(key => key.startsWith(`audio_${crn}`))
              .map(async key => {
                const uri = await AsyncStorage.getItem(key);
                return { key, uri };
              })
          );

          // Remove duplicates
          const uniqueVideos = Array.from(new Set(videoUris.map(v => v.uri)))
            .map(uri => videoUris.find(v => v.uri === uri));
          const uniqueAudios = Array.from(new Set(audioUris.map(a => a.uri)))
            .map(uri => audioUris.find(a => a.uri === uri));

          setVideoList(uniqueVideos);
          setAudioList(uniqueAudios);
        } else {
          Alert.alert('No CRN found', 'CRN is missing.');
        }
      } catch (error) {
        console.error('Error loading files:', error);
      }
    };

    loadFiles();
  }, []);

  const handlePlay = (uri, type) => {
    if (type === "video") {
      if (uri.length > 0) {
        setPlayingUri(uri);
        setPlaybackType('video');
      } else {
        Alert.alert("Video Not Available");
      }
    } else if (type === "audio") {
      if (uri.length > 0) {
        setPlayingUri(uri);
        setPlaybackType('audio');
      } else {
        Alert.alert("Audio Not Available");
      }
    }
  };

  const handleDelete = async (uriToDelete, type) => {
    try {
      await AsyncStorage.removeItem(`${type}_${uriToDelete}`);
      if (type === 'video') {
        setVideoList(prevList => prevList.filter(v => v.uri !== uriToDelete));
      } else if (type === 'audio') {
        setAudioList(prevList => prevList.filter(a => a.uri !== uriToDelete));
      }
      Alert.alert('Deleted', 'The file has been deleted.');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const renderFileItem = ({ item, type }) => (
    <View style={styles.fileContainer}>
      <TouchableOpacity onPress={() => handlePlay(item.uri, type)} style={styles.playButton}>
        <Icon name="play" size={24} color="#fff" />
        <Text style={styles.playButtonText}>Play {type}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.uri, type)} style={styles.deleteButton}>
        <Icon name="trash-2" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {videoList.length === 0 && audioList.length === 0 ? (
        <Text>No files available</Text>
      ) : (
        <>
          {videoList.length > 0 && (
            <FlatList
              data={videoList}
              keyExtractor={(item) => item.uri}
              renderItem={(props) => renderFileItem({ ...props, type: 'video' })}
            />
          )}
          {audioList.length > 0 && (
            <FlatList
              data={audioList}
              keyExtractor={(item) => item.uri}
              renderItem={(props) => renderFileItem({ ...props, type: 'audio' })}
            />
          )}
        </>
      )}
      {playingUri && playbackType && (
        playbackType === 'video' ? (
          <PlayVideo uri={playingUri} />
        ) : (
          <PlayAudio uri={playingUri} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '',
  },
  fileContainer: {
    width: 300,
    marginTop: 10,
    justifyContent: "space-evenly",
    backgroundColor: "blue"
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
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
