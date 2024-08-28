import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather'; // Import icons from Feather
import PlayAudio from './playAudio';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import PlayVideo from './playVideo';
import { Button } from 'react-native-paper';


const { width } = Dimensions.get('window');

const Downloads = ({navigation}) => {
  const [videoList, setVideoList] = useState([]);
  const [audioList, setAudioList] = useState([]);
  const [playingUri, setPlayingUri] = useState(null);
  const [playbackType, setPlaybackType] = useState(null); // 'audio' or 'video'
  console.log('====================================');
  console.log(videoList,"xxxxxxxxxxxxxx");
  console.log('====================================');


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
          console.log('====================================');
          console.log(videoUris);
          console.log('====================================');
          const audioUris = await Promise.all(
            allKeys
              .filter(key => key.startsWith(`audio_${crn}`))
              .map(async key => {
                const uri = await AsyncStorage.getItem(key);
                return { key, uri };
              })
          );
          console.log('====================================');
          console.log(audioUris,"eeeeeeeeeeeee");
          console.log('====================================');
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



  return (
    <View style={styles.container}>
      {videoList.length === 0 && audioList.length === 0 ? (
        <Text>No files available</Text>
      ) : (
        <>
          {videoList.length > 0 && (
 <View style={styles.fileContainer}>
 <TouchableOpacity onPress={() => handlePlay(videoList[0].uri, "video")} style={styles.playButton}>
   <Icon name="play" size={24} color="#fff" />
   <Text style={styles.playButtonText}>Play {"video"}</Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleDelete(videoList[0].uri, "video")} style={styles.deleteButton}>
   <Icon name="trash-2" size={24} color="#fff" />
 </TouchableOpacity>
</View>
          )}
          {audioList.length > 0 && (
 <View style={styles.fileContainer}>
 <TouchableOpacity onPress={() => handlePlay(audioList[0].uri, "audio")} style={styles.playButton}>
   <Icon name="play" size={24} color="#fff" />
   <Text style={styles.playButtonText}>Play {"audio"}</Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleDelete(audioList[0].uri, "audio")} style={styles.deleteButton}>
   <Icon name="trash-2" size={24} color="#fff" />
 </TouchableOpacity>
</View>
          )}
        </>
      )}
      {playingUri && playbackType && (
        playbackType === 'video' ? (
          <View style={{flex:1,backgroundColor:"red",marginBottom:100}}>

            <PlayVideo uri={playingUri} />
          </View>
        ) : (
          <PlayAudio uri={playingUri} />
        )
      )}

      <Icons style={{marginTop:35}} name="keyboard-backspace" size={30} onPress={()=>navigation.navigate("Home")}/>
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
