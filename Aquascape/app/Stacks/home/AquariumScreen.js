import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, Image, StyleSheet, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from '../../../firebase/firebase';
import { useFocusEffect } from '@react-navigation/native';
import Fish from '../../../constants/Fish'; // Import updated Fish component using reanimated

// Importing Colors and Elements for styling
import Colors from '../../../constants/Colors';
import Elements from '../../../constants/Elements';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const AquariumScreen = ({ navigation }) => {
  const [fishArray, setFishArray] = useState([]);
  const imageMap = {
    "Pufferfish.gif": require("../../../assets/Pufferfish.gif"),
    "StaticShark.gif": require("../../../assets/StaticShark.gif"),
    "goldfish-export.gif": require("../../../assets/goldfish-export.gif"),
    // Add more images here as needed
  };

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

              const updatedFishArray = fishData.map((fish, index) => ({
                id: index,
                imageSource: imageMap[fish.fileName] || null,
                positionX: Math.random() * (screenWidth * 4 - 150),
                positionY: Math.random() * (screenHeight - 120),  // Random vertical position
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
      <ScrollView style={styles.scrollContainer} horizontal={true} showsHorizontalScrollIndicator={true}>
        <View style={styles.bannerContainer}>
          <Image source={require('../../../assets/backgroundSample.png')} style={styles.banner} resizeMode="cover" />
          {fishArray.map((fish) => (
            fish.imageSource && (
              <Fish
                key={fish.id}
                imageSource={fish.imageSource}
                positionX={fish.positionX}
                positionY={fish.positionY}
              />
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
    width: screenWidth * 4, // Set this to allow space for the fish to move within the horizontal scroll
    position: 'relative',
  },
  banner: {
    height: '100%',
    width: '100%',
  },
  storeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});
