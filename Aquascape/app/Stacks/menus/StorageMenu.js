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
};

const StorageMenu = () => {
  const [storageFish, setStorageFish] = useState([]);
  const [aquariumFish, setAquariumFish] = useState([]);

  const [selectedFish, setSelectedFish] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchFishData = async () => {
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
          }
        } catch (error) {
          console.error("Error fetching fish data:", error);
        }
      }
    };

    fetchFishData();
  }, []);

  const handlePress = (fish, isFromStorage) => {
    setSelectedFish({ ...fish, isFromStorage });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedFish(null);
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

  const handleMoveToStorage = async () => {
    const user = auth.currentUser;
    if (user && selectedFish) {
      const uid = user.uid;
      const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
  
      try {
        const aquariumSnap = await getDoc(aquariumDocRef);
        if (aquariumSnap.exists()) {
          const data = aquariumSnap.data();
  
          // Remove the fish from the aquarium
          const updatedFishArray = data.fish.filter(
            (fish) =>
              !(
                fish.name === selectedFish.name &&
                fish.fileName === selectedFish.fileName
              )
          );
  
          // Add the fish to the storage array
          const existingStorageFish = data.storageFish.find(
            (fish) => fish.name === selectedFish.name
          );
  
          const updatedStorageFish = existingStorageFish
            ? data.storageFish.map((fish) =>
                fish.name === selectedFish.name
                  ? { ...fish, count: fish.count + 1 }
                  : fish
              )
            : [
                ...data.storageFish,
                {
                  name: selectedFish.name,
                  fileName: selectedFish.fileName,
                  rarity: selectedFish.rarity || "common", // Default to "common" if rarity is missing
                  count: 1,
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
  
          Alert.alert("Success", `${selectedFish.name} has been moved to storage.`);
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

    return (
      <View style={styles.itemGrid}>
        {fishArray.map((item, index) => (
          <TouchableOpacity
            style={styles.itemContainer}
            key={`${item.name}-${index}`}
            onPress={() => handlePress(item, isFromStorage)}
          >
            {item.count && (
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

  return (
    <GestureHandlerRootView>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 16 }} 
        keyboardShouldPersistTaps="handled" 
      >
        <Text style={styles.title}>Storage</Text>
        {renderFishItems(storageFish, true)}
        
        <Text style={styles.title}>Aquarium</Text>
        {renderFishItems(aquariumFish, false)}

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
                    <TouchableOpacity style={styles.addButton} onPress={handleAddToAquarium}>
                      <Text style={styles.addButtonText}>Add to Aquarium</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.addButton} onPress={handleMoveToStorage}>
                      <Text style={styles.addButtonText}>Move to Storage</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    color: "#A0522D",
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
});
