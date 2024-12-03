import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';

const LoadingOverlay = ({ message = 'Loading...' }) => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/Splash Animations/bubbles.gif')}
                style={styles.gif}
            />
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 152, 219, 0.7)', // Semi-transparent background
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 100,
    },
    gif: {
        width: 150, // Adjust as per your design
        height: 150, // Adjust as per your design
        marginBottom: 20,
    },
    message: {
        marginTop: 10,
        marginBottom: 50,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default LoadingOverlay;
