import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Image, StyleSheet, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { auth } from '../../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from '../../../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native';

// Importing Colors and Elements for styling
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const AquariumScreen = ({ navigation }) => {
  const [fishArray, setFishArray] = useState(Array(15).fill(null).map((_, index) => ({
    id: index + 1,
    offset: useSharedValue(Math.random() * (screenWidth * 3)),
    direction: useSharedValue(Math.random() > 0.5 ? 1 : -1),
    targetDistance: Math.random() * (screenWidth * 2 - screenWidth) + screenWidth,
    duration: Math.random() * 6000 + 5000,
    scaleX: useSharedValue(Math.random() > 0.5 ? 1 : -1),
    positionY: Math.random() * (screenHeight - 120),
    image: null,  // Placeholder for the image, will be set based on fetched data
  })));

  const imageMap = {
    "Pufferfish.gif": require("../../../assets/Pufferfish.gif"),
    "StaticShark.gif": require("../../../assets/StaticShark.gif"),
    "goldfish-export.gif": require("../../../assets/goldfish-export.gif"),
    // Add more images here as needed
  };

  // Fetch the aquarium data each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchAquariumData = async () => {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const aquariumRef = doc(firestoreDB, "aquarium", uid);

          try {
            const aquariumSnap = await getDoc(aquariumRef);
            if (aquariumSnap.exists()) {
              const fishData = aquariumSnap.data().fish;
              console.log(fishData);

              // Map fetched fish data to update the image in fishArray
              setFishArray(prevFishArray => prevFishArray.map((fish, index) => {
                const fetchedFish = fishData[index];
                return fetchedFish
                  ? { ...fish, image: imageMap[fetchedFish.fileName] || null }
                  : fish;
              }));
            } else {
              console.log("No aquarium data found");
            }
          } catch (error) {
            console.error("Error fetching aquarium data: ", error);
          }
        }
      };

      fetchAquariumData();
    }, [])
  );

  const fishStyles = fishArray.map(fish =>
    useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: fish.offset.value },
          { scaleX: fish.scaleX.value },
        ],
        top: fish.positionY,
      };
    })
  );

  useEffect(() => {
    fishArray.forEach(fish => {
      const targetPosition = fish.direction.value === 1
        ? Math.min(fish.offset.value + fish.targetDistance, screenWidth * 3)
        : Math.max(fish.offset.value - fish.targetDistance, 0);

      fish.offset.value = withRepeat(
        withTiming(targetPosition, { duration: fish.duration }, () => {
          fish.direction.value *= -1;
          fish.scaleX.value *= -1;
        }),
        -1,
        true
      );
    });
  }, [fishArray]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scrollContainer} horizontal={true} showsHorizontalScrollIndicator={true}>
        <View style={styles.bannerContainer}>
          <Image source={require('../../../assets/backgroundSample.png')} style={styles.banner} resizeMode="cover" />
          {fishArray.map((fish, index) => (
            fish.image && (
              <Animated.View key={fish.id} style={[styles.box, fishStyles[index]]}>
                <Image source={fish.image} style={styles.boxImage} resizeMode="contain" />
              </Animated.View>
            )
          ))}
        </View>
      </ScrollView>
       {/* Store button using mainButton styles from Elements */}
      <TouchableOpacity style={[Elements.mainButton, styles.storeButton]} onPress={() => navigation.navigate("Store")}>
        <Text style={Elements.mainButtonText}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AquariumScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ADD8E6',
  },
  bannerContainer: {
    height: screenHeight,
    width: screenWidth * 4,
    position: 'relative',
  },
  banner: {
    height: '100%',
    width: '100%',
  },
  box: {
    height: 120,
    width: 120,
    borderRadius: 20,
    position: 'absolute',
  },
  boxImage: {
    height: 100,
    width: 100,
  },
  storeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});
