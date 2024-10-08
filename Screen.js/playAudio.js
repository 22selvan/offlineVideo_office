import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function PlayAudio({route}) {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const { uri } = route.params;

    async function loadAudio() {
        try {
            const { sound, status } = await Audio.Sound.createAsync(
                { uri :uri[0].audioUri},
                { shouldPlay: isPlaying },
                onPlaybackStatusUpdate
            );
            setSound(sound);
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading audio:', error);
        }
  
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
    }, [uri]);

    const downloadAudio = async (audioUri, userId) => {
        try {
            const crn = await AsyncStorage.getItem("CRN");
            if (!crn) {
                throw new Error('CRN not found in AsyncStorage');
            }
    
            const fileUri = FileSystem.documentDirectory + `audio_${crn}.mp3`;
            const { uri } = await FileSystem.downloadAsync(audioUri, fileUri);
    
            await AsyncStorage.setItem(`audio_${crn}`, uri);
    
            alert('Audio downloaded successfully!');
        } catch (error) {
            console.error('Error downloading audio:', error);
            alert('Failed to download audio');
        }
    };

    const handleDownload = async () => {
        const audioUri = 'https://example.com/audiofile.mp3'; // Replace with your audio URL
        const userId = 'someUserId'; // Replace with actual user ID if needed
        await downloadAudio(audioUri, userId);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Music Player</Text>
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
});
