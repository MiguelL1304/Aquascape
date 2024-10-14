import React, { useState, useEffect } from "react";
import { ScrollView, Image, StyleSheet, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../../firebase/firebase';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

// Importing Colors and Elements for styling
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const AquariumScreen = ({ navigation }) => {
  const [uid, setUid] = useState(null);
  const offset = useSharedValue(0);  // Start the animation from the leftmost edge
  const direction = useSharedValue(1);  // 1 for moving right, -1 for moving left

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value },
        { scaleX: direction.value },  // Use direction for flipping the shark
      ],
    };
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
    }

    // Start the animation, moving back and forth across the scrollable area
    offset.value = withRepeat(
      withTiming(screenWidth * 4 - 120, { duration: 9000 }, (finished) => {
        // After every animation cycle, change the direction
        direction.value *= -1;  // Flip direction
      }),
      -1,  // Infinite repeat
      true  // Alternate direction
    );
  }, []);

  // Handle the store button press
  const handleStore = () => {
    navigation.navigate("Store");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollContainer}
        horizontal={true} // Enables horizontal scrolling
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../../../assets/backgroundSample.png')} 
            style={styles.banner}
            resizeMode="cover" // Use cover to maintain aspect ratio and fill the container
          />
          {/* Animated box inside banner container */}
          <Animated.View style={[styles.box, animatedStyles]}>
            <Image
              source={require('../../../assets/Splash Animations/shark2.gif')}
              style={styles.boxImage}
              resizeMode="contain"  // Adjust as per your need
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Store button using mainButton styles from Elements */}
      <TouchableOpacity style={[Elements.mainButton, styles.storeButton]} onPress={handleStore}>
        <Text style={Elements.mainButtonText}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AquariumScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
  },
  bannerContainer: {
    height: screenHeight,  // Full screen height
    width: screenWidth * 4,  // Stretch the width to be four times the screen width for horizontal scrolling
    position: 'relative',  // Position relative to allow absolute positioning of the box
  },
  banner: {
    height: '100%',  // Fill the entire container height
    width: '100%',   // Stretch the image to fill the width of the container
  },
  box: {
    height: 120,
    width: 120,
    borderRadius: 20,
    position: 'absolute',  // Position the box absolutely inside the container
    top: screenHeight / 2 - 60,  // Vertically center the box
    left: 0,  // Start the box at the leftmost edge
  },
  boxImage: {
    height: 100,
    width: 100,  // Adjust to fit within the box
  },
  storeButton: {
    position: 'absolute',  // Keep the button at the bottom right
    bottom: 30,
    right: 30,
  },
});