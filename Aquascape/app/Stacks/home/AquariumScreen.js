import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, useWindowDimensions } from 'react-native';
import { Canvas, useImage, Image as SkiaImage } from "@shopify/react-native-skia";
import { auth, firestoreDB } from '../../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';
import Fish from '../../../constants/Fish'; // Import the Fish component

const AquariumScreen = ({ navigation }) => {
  const { height: screenHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight(); // Get the height of the bottom tab bar
  const aquariumHeight = screenHeight - tabBarHeight; // Calculate aquarium height
  const aquariumWidth = aquariumHeight * 4; // Maintain the 1:4 aspect ratio

  const MIN_X_POSITION = 0;
  const MAX_X_POSITION = aquariumWidth - 150;
  const MIN_Y_POSITION = 100;
  const MAX_Y_POSITION = aquariumHeight - 120;

  const [fishArray, setFishArray] = useState([]);

  // Define image map for fish images
  const imageMap = {
    "Pufferfish.gif": require("../../../assets/Pufferfish.gif"),
    "StaticShark.gif": require("../../../assets/StaticShark.gif"),
    "goldfish-export.gif": require("../../../assets/goldfish-export.gif"),
  };

  // Load the background image using Skia
  const background = useImage(require("../../../assets/backgroundSample.png"));

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
              const updatedFishArray = fishData.map((fish, index) => ({
                id: index,
                fileName: fish.fileName,
                positionX: Math.random() * (MAX_X_POSITION - MIN_X_POSITION) + MIN_X_POSITION,
                positionY: Math.random() * (MAX_Y_POSITION - MIN_Y_POSITION) + MIN_Y_POSITION,
              }));
              setFishArray(updatedFishArray);
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ width: aquariumWidth, height: aquariumHeight }}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <Canvas style={[styles.canvas, { width: aquariumWidth, height: aquariumHeight }]}>
            {/* Render the background image directly with SkiaImage */}
            {background && (
              <SkiaImage
                image={background}
                x={0}
                y={0}
                width={aquariumWidth} // Updated width
                height={aquariumHeight} // Updated height
                fit="cover" // Scale to cover the entire background area
              />
            )}
          </Canvas>

          {/* Render each fish as an animated Fish component */}
          {fishArray.map((fish) => (
            <Fish
              key={fish.id}
              imageSource={imageMap[fish.fileName]}
              positionX={fish.positionX}
              positionY={fish.positionY}
              aquariumWidth={aquariumWidth}
              aquariumHeight={aquariumHeight}
            />
          ))}
        </View>
      </ScrollView>

      {/* Store Button positioned absolutely on the screen, not in the scroll view */}
      <TouchableOpacity
        style={[Elements.mainButton, styles.storeButton]}
        onPress={() => navigation.navigate("Store")}
      >
        <Text style={Elements.mainButtonText}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AquariumScreen;

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
  storeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1, // Ensure it's above other elements
  },
});
