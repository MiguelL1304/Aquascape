import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Alert } from "react-native";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

import { auth, firestoreDB } from "../../../firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import Colors from "../../../constants/Colors";

const imageMap = {
  "Shark.gif": require("../../../assets/fish/Shark.gif"),
  "Clownfish.gif": require("../../../assets/fish/Clownfish.gif"),
  "Pufferfish.gif": require("../../../assets/fish/Pufferfish.gif"),
  "Bluetang.gif": require("../../../assets/fish/Bluetang.gif"),
  "Catfish.gif": require("../../../assets/fish/Catfish.gif"),
  "Goldfish.gif": require("../../../assets/fish/Goldfish.gif"),
  "Blobfish.gif": require("../../../assets/fish/Blobfish.gif"),
  "Happyfish.gif": require("../../../assets/fish/Happyfish.gif"),
};

const backgroundImageMap = {
  "backgroundSample.png": require("../../../assets/backgroundSample.png"),
  "desert-bg.png": require("../../../assets/backgrounds/desert-bg.png"),
  "futuristic-city-bg.png": require("../../../assets/backgrounds/futuristic-city-bg.png"),
  "jungle-bg.png": require("../../../assets/backgrounds/jungle-bg.png"),
  "space-bg.png": require("../../../assets/backgrounds/space-bg.png"),
};

const initialBackgrounds = [
  { fileName: "backgroundSample.png", name: "Default" },
  { fileName: "desert-bg.png", name: "Desert" },
  { fileName: "futuristic-city-bg.png", name: "Futuristic City" },
  { fileName: "jungle-bg.png", name: "Jungle" },
  { fileName: "space-bg.png", name: "Space" }
];

const StorageMenu = ({ refreshAquarium }) => {
  const [storageFish, setStorageFish] = useState([]);
  const [aquariumFish, setAquariumFish] = useState([]);

  const [storageBackgrounds, setStorageBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(null);


  const [selectedCategory, setSelectedCategory] = useState("Storage");


  const [selectedFish, setSelectedFish] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedBackground, setSelectedBackground] = useState(null);
  const [isBackgroundModalVisible, setIsBackgroundModalVisible] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
        try {
          const aquariumSnap = await getDoc(aquariumDocRef);
          if (aquariumSnap.exists()) {
            const data = aquariumSnap.data();
            setStorageFish(data.storageFish || []);
            setAquariumFish(data.fish || []);
            setStorageBackgrounds(data.storageBackgrounds || []); // Only fetch purchased backgrounds
            setCurrentBackground(data.currentBackground || null); // Fetch current background

          } else {
            console.log("Aquarium document does not exist!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, []);
  

  const handlePress = (fish, isFromStorage) => {
    setSelectedFish({ ...fish, isFromStorage });
    setIsModalVisible(true);
  };

  const handleBackgroundSelect = (background) => {
    setSelectedBackground(background); // Set the selected background
    setIsBackgroundModalVisible(true); // Show the modal
  };
  

  

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedFish(null);
  };

  const closeBackgroundModal = () => {
    setIsBackgroundModalVisible(false);
    setSelectedBackground(null);
  };
  

  const handleAddToAquarium = async () => {
    const user = auth.currentUser;
    if (user && selectedFish) {
      const uid = user.uid;
      const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
  
      try {
        const aquariumSnap = await getDoc(aquariumDocRef);
        if (aquariumSnap.exists()) {
          const data = aquariumSnap.data();
  
          // Check if the aquarium already has this fish (only relevant for rare fish)
          const isRare = selectedFish.rarity === "rare";
          const fishInAquarium = data.fish.find((fish) => fish.name === selectedFish.name);
  
          if (isRare && fishInAquarium) {
            Alert.alert(
              "Fish Already in Aquarium",
              "You can only have one rare fish in the aquarium."
            );
            return;
          }
  
          // Add the fish to the aquarium array
          const updatedFishArray = [...data.fish, { name: selectedFish.name, fileName: selectedFish.fileName, rarity: selectedFish.rarity }];
          await updateDoc(aquariumDocRef, { fish: updatedFishArray });
  
          // Update storageFish (decrement count or remove fish)
          const updatedStorageFish = data.storageFish
            .map((fish) =>
              fish.name === selectedFish.name && fish.count > 1
                ? { ...fish, count: fish.count - 1 }
                : fish.name === selectedFish.name && fish.count === 1
                ? null
                : fish
            )
            .filter(Boolean);
  
          await updateDoc(aquariumDocRef, { storageFish: updatedStorageFish });
          setStorageFish(updatedStorageFish);

          refreshAquarium();

          // Update local state
          setAquariumFish(updatedFishArray);
          setStorageFish(updatedStorageFish);
  
          Alert.alert("Success", `${selectedFish.name} has been added to the aquarium.`);
        }
      } catch (error) {
        console.error("Error adding fish to aquarium:", error);
        Alert.alert("Error", "An error occurred. Please try again.");
      } finally {
        closeModal();
      }
    }
  };

  const handleMoveToStorage = async (moveAll = false) => {
    const user = auth.currentUser;
    if (user && selectedFish) {
      const uid = user.uid;
      const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
  
      try {
        const aquariumSnap = await getDoc(aquariumDocRef);
        if (aquariumSnap.exists()) {
          const data = aquariumSnap.data();
  
          // Filter out the selected fish from the aquarium
          let updatedFishArray = data.fish.filter(
            (fish) => fish.name !== selectedFish.name || fish.fileName !== selectedFish.fileName
          );
  
          if (!moveAll) {
            // If not moving all, add one instance back to aquarium
            const selectedIndex = data.fish.findIndex(
              (fish) => fish.name === selectedFish.name && fish.fileName === selectedFish.fileName
            );
            if (selectedIndex !== -1) {
              updatedFishArray = [
                ...updatedFishArray,
                data.fish[selectedIndex],
              ];
            }
          }
  
          // Update storageFish
          const existingStorageFish = data.storageFish.find(
            (fish) => fish.name === selectedFish.name
          );
  
          const updatedStorageFish = existingStorageFish
            ? data.storageFish.map((fish) =>
                fish.name === selectedFish.name
                  ? { ...fish, count: fish.count + (moveAll ? selectedFish.count : 1) }
                  : fish
              )
            : [
                ...data.storageFish,
                {
                  name: selectedFish.name,
                  fileName: selectedFish.fileName,
                  rarity: selectedFish.rarity || "common",
                  count: moveAll ? selectedFish.count : 1,
                },
              ];
  
          // Update Firestore
          await updateDoc(aquariumDocRef, {
            fish: updatedFishArray,
            storageFish: updatedStorageFish,
          });
  
          // Update local state
          setAquariumFish(updatedFishArray);
          setStorageFish(updatedStorageFish);
  
          Alert.alert(
            "Success",
            `${selectedFish.name} has been moved to storage${
              moveAll ? " (all)" : ""
            }.`
          );
        }
      } catch (error) {
        console.error("Error moving fish to storage:", error);
        Alert.alert("Error", "An error occurred. Please try again.");
      } finally {
        closeModal();
      }
    }
  };
  
  
  
  

  const renderFishItems = (fishArray, isFromStorage) => {
    if (fishArray.length === 0) {
      return (
        <View style={styles.emptyMessageContainer}>
          <Text style={styles.emptyMessageText}>No fish available.</Text>
        </View>
      );
    }
  
    // Group fish by name and fileName, and count duplicates
    const groupedFish = fishArray.reduce((acc, fish) => {
      const existingFish = acc.find(
        (item) => item.name === fish.name && item.fileName === fish.fileName
      );
      if (existingFish) {
        existingFish.count += isFromStorage ? fish.count || 1 : 1;
      } else {
        acc.push({ ...fish, count: isFromStorage ? fish.count || 1 : 1 });
      }
      return acc;
    }, []);
  
    return (
      <View style={styles.itemGrid}>
        {groupedFish.map((item, index) => (
          <TouchableOpacity
            style={styles.itemContainer}
            key={`${item.name}-${index}`}
            onPress={() => handlePress(item, isFromStorage)}
          >
            {item.count > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            )}
            <Image source={imageMap[item.fileName]} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  
  

  const renderBackgroundItems = (backgroundsArray, isCurrent) => {
    if (backgroundsArray.length === 0 && !isCurrent) {
      return (
        <View style={styles.emptyMessageContainer}>
          <Text style={styles.emptyMessageText}>No backgrounds available.</Text>
        </View>
      );
    }
  
    const filteredBackgrounds = isCurrent
      ? backgroundsArray // Show all backgrounds for "Current Background"
      : backgroundsArray.filter((bg) => bg.fileName !== currentBackground); // Exclude currentBackground from storage
  
    return (
      <View style={styles.itemGrid}>
        {filteredBackgrounds.map((background, index) => (
          <TouchableOpacity
            key={`${background.name}-${index}`}
            onPress={() => handleBackgroundSelect(background)}
            style={styles.itemContainer}
          >
            <Image source={backgroundImageMap[background.fileName]} style={styles.itemImage} />
            <Text style={styles.itemName}>{background.name}</Text>
          </TouchableOpacity>
        ))}
        {isCurrent && currentBackground && (
          <TouchableOpacity
            key="current-background"
            onPress={() =>
              handleBackgroundSelect({
                name: initialBackgrounds.find(
                  (bg) => bg.fileName === currentBackground
                )?.name || "Default Background", // Find the name dynamically
                fileName: currentBackground,
              })
            }
            style={styles.itemContainer}
          >
            <Image
              source={backgroundImageMap[currentBackground]}
              style={styles.itemImage}
            />
            <Text style={styles.itemName}>
              {initialBackgrounds.find((bg) => bg.fileName === currentBackground)
                ?.name || "Default Background"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  
  
  

  return (
    <GestureHandlerRootView>
      <View style={styles.categoryContainer}>
  <TouchableOpacity
    style={[
      styles.categoryButton,
      selectedCategory === "Storage" && styles.activeCategoryButton,
    ]}
    onPress={() => setSelectedCategory("Storage")}
  >
    <Text style={styles.categoryButtonText}>Storage</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[
      styles.categoryButton,
      selectedCategory === "Aquarium" && styles.activeCategoryButton,
    ]}
    onPress={() => setSelectedCategory("Aquarium")}
  >
    <Text style={styles.categoryButtonText}>Aquarium</Text>
  </TouchableOpacity>
</View>


<ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
  {selectedCategory === "Storage" ? (
    <>
      <Text style={styles.title}>Fish</Text>
      {renderFishItems(storageFish, true)}
      <Text style={styles.title}>Backgrounds</Text>
      {renderBackgroundItems(storageBackgrounds, false)}
    </>
  ) : (
    <>
    <Text style={styles.title}>Current Background</Text>
    {renderBackgroundItems([], true)}
      <Text style={styles.title}>Fish</Text>
      {renderFishItems(aquariumFish, false)}
      
    </>
  )}
        {/* Modal for fish details */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedFish && (
                <>
                  <Text style={styles.modalText}>{selectedFish.name}</Text>
                  <Image source={imageMap[selectedFish.fileName]} style={styles.modalImage} />
                  {selectedFish.isFromStorage ? (
                    // If fish is in storage, allow adding to the aquarium
                    <TouchableOpacity style={styles.addButton} onPress={handleAddToAquarium}>
                      <Text style={styles.addButtonText}>Add to Aquarium</Text>
                    </TouchableOpacity>
                  ) : (
                    // If fish is in the aquarium, allow moving one or all back to storage
                    <>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleMoveToStorage(false)} // Move one fish to storage
                      >
                        <Text style={styles.addButtonText}>Move to Storage</Text>
                      </TouchableOpacity>
                      {selectedFish.count > 1 && ( // Only show "Move All to Storage" if count > 1
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleMoveToStorage(true)} // Move all duplicates to storage
                        >
                          <Text style={styles.addButtonText}>Move All to Storage</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>



        {/* Background Modal */}
        <Modal
  animationType="fade"
  transparent={true}
  visible={isBackgroundModalVisible}
  onRequestClose={() => setIsBackgroundModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {selectedBackground && (
        <>
          <Text style={styles.modalText}>{selectedBackground.name}</Text>
          <Image source={backgroundImageMap[selectedBackground.fileName]} style={styles.modalImage} />
          {/* Show "Remove Background" button only if in Aquarium and not the default background */}
          {selectedCategory === "Aquarium" && selectedBackground.fileName !== "backgroundSample.png" && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => {
                const user = auth.currentUser;
                if (user) {
                  const uid = user.uid;
                  const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
                  try {
                    // Update Firestore with the default background
                    await updateDoc(aquariumDocRef, { currentBackground: "backgroundSample.png" });
                    // Update local state
                    setCurrentBackground("backgroundSample.png");
                    Alert.alert("Success", "Background has been replaced with the default.");
                  } catch (error) {
                    console.error("Error replacing background:", error);
                    Alert.alert("Error", "Failed to replace the background. Please try again.");
                  } finally {
                    setIsBackgroundModalVisible(false);
                  }
                }
              }}
            >
              <Text style={styles.addButtonText}>Remove Background</Text>
            </TouchableOpacity>
          )}
          {/* Button to apply a new background */}
          {selectedBackground.fileName !== currentBackground && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => {
                const user = auth.currentUser;
                if (user) {
                  const uid = user.uid;
                  const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
                  try {
                    await updateDoc(aquariumDocRef, { currentBackground: selectedBackground.fileName });
                    setCurrentBackground(selectedBackground.fileName); // Update local state
                    Alert.alert("Success", `${selectedBackground.name} has been applied.`);
                  } catch (error) {
                    console.error("Error applying background:", error);
                    Alert.alert("Error", "Failed to apply the background. Please try again.");
                  } finally {
                    setIsBackgroundModalVisible(false);
                  }
                }
              }}
            >
              <Text style={styles.addButtonText}>Apply Background</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsBackgroundModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>

      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default StorageMenu;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightBlue,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginVertical: 10,
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemContainer: {
    width: "48%",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFFFCC",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#A0522D",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  itemImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.theme.orange,
  },
  countBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#A0522D",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#FFFFCC",
    borderWidth: 8,
    borderColor: "#8B4513",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FF9500",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#A0522D",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#A0522D",
    fontStyle: "italic",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    
  },
  categoryButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.theme.yellow,
    borderColor: Colors.theme.brown,
    borderWidth: 3,
    width: "40%",
    alignItems: "center",
  },
  activeCategoryButton: {
    backgroundColor: "#FFB74D",
    
  },
  categoryButtonText: {
    color: Colors.theme.brown,
    fontWeight: "bold",
  },
  
  
});
