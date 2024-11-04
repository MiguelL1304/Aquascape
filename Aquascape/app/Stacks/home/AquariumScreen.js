import React, { useState, useEffect } from "react";
import { ScrollView, Image, StyleSheet, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

//Firebase Imports
import { auth } from '../../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from '../../../firebase/firebase';

// Importing Colors and Elements for styling
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const AquariumScreen = ({ navigation }) => {
  const [uid, setUid] = useState(null);

  const [aquariumData, setAquariumData] = useState(null);
  //const [fishArray, setFishArray] = useState([]);

  useEffect(() => {
    const fetchAquariumData = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const aquariumRef = doc(firestoreDB, "aquarium", uid);

        try {
          const aquariumSnap = await getDoc(aquariumRef);
          if (aquariumSnap.exists()) {
            const data = aquariumSnap.data(); // Assign aquariumSnap.data() to `data`
            setAquariumData(data);

            // const fishes = generateFishArray(data); // Use `data` here
            // setFishArray(fishes);

          } else {
            console.log("No aquarium data found");
          }
        } catch (error) {
          console.error("Error fetching aquarium data: ", error);
        }
      }
    };

    fetchAquariumData();
  }, []);
  
  // Array of fish with randomized initial positions, directions, distances, and durations
  const fishArray = [
    {
      id: 1,
      offset: useSharedValue(Math.random() * (screenWidth * 3)),
      direction: useSharedValue(Math.random() > 0.5 ? 1 : -1),
      targetDistance: Math.random() * (screenWidth * 2 - screenWidth) + screenWidth,
      duration: Math.random() * 6000 + 5000,
      scaleX: useSharedValue(Math.random() > 0.5 ? 1 : -1),
      positionY: Math.random() * (screenHeight - 120), // Random vertical position within the screen height
      image: require('../../../assets/Pufferfish.gif'),
    },
    {
      id: 2,
      offset: useSharedValue(Math.random() * (screenWidth * 3)),
      direction: useSharedValue(Math.random() > 0.5 ? 1 : -1),
      targetDistance: Math.random() * (screenWidth * 2 - screenWidth) + screenWidth,
      duration: Math.random() * 6000 + 5000,
      scaleX: useSharedValue(Math.random() > 0.5 ? 1 : -1),
      positionY: Math.random() * (screenHeight - 120),
      image: require('../../../assets/StaticShark.gif'),
    },
    // Add more fish objects as needed
  ];

  const imageMap = {
    "Pufferfish.gif": require("../../../assets/Pufferfish.gif"),
    "StaticShark.gif": require("../../../assets/StaticShark.gif"),
    // Add more images here as needed
  };

  // const generateFishArray = (aquariumData) => {
  //   return aquariumData.fish.map((fish, index) => ({
  //     id: index + 1,
  //     targetDistance: Math.random() * (screenWidth * 2 - screenWidth) + screenWidth,
  //     duration: Math.random() * 6000 + 5000,
  //     positionY: Math.random() * (screenHeight - 120),
  //     image: imageMap[fish.fileName] || null, // Use imageMap to get the correct image source
  //     // Hooks like `useSharedValue` will be added in the component later
  //   }));
  // };

  // Initialize each fish's scaleX based on direction so it faces the correct way initially
  fishArray.forEach(fish => {
    fish.scaleX.value = fish.direction.value === 1 ? 1 : -1;
  });

  // Animated styles for each fish based on their direction and offset
  const fishStyles = fishArray.map(fish =>
    useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: fish.offset.value },
          { scaleX: fish.scaleX.value },
        ],
        top: fish.positionY, // Position each fish at a random vertical position
      };
    })
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
    }

    fishArray.forEach(fish => {
      // Calculate initial target position
      const targetPosition = fish.direction.value === 1
        ? Math.min(fish.offset.value + fish.targetDistance, screenWidth * 3)
        : Math.max(fish.offset.value - fish.targetDistance, 0);

      // Start repeating animation
      fish.offset.value = withRepeat(
        withTiming(targetPosition, { duration: fish.duration }, () => {
          // Toggle direction and flip scaleX when direction changes
          fish.direction.value *= -1;
          fish.scaleX.value *= -1; // Flip the image
        }),
        -1, // Infinite repetition
        true // Alternate direction on each repeat
      );
    });
  }, []);

  // Handle the store button press
  const handleStore = () => {
    navigation.navigate("Store");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../../../assets/backgroundSample.png')} 
            style={styles.banner}
            resizeMode="cover"
          />
          {/* Map through fish array and render each Animated fish */}
          {fishArray.map((fish, index) => (
            <Animated.View key={fish.id} style={[styles.box, fishStyles[index]]}>
              <Image
                source={fish.image}
                style={styles.boxImage}
                resizeMode="contain"
              />
            </Animated.View>
          ))}
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
    top: screenHeight / 2 - 60,
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

