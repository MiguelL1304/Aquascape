import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, Modal, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, firestoreDB } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

const StoreScreen = ({ navigation }) => {
  const [items, setItems] = useState([
    { id: "1", name: "Shark", image: require("../../assets/fish/Shark.gif"), price: 100, fileName: "Shark.gif", rarity: "common", unlocked: true },
    { id: "2", name: "Clownfish", image: require("../../assets/fish/Clownfish.gif"), price: 100, fileName: "Clownfish.gif", rarity: "common", unlocked: true },
    { id: "3", name: "Pufferfish", image: require("../../assets/fish/Pufferfish.gif"), price: 100, fileName: "Pufferfish.gif", rarity: "common", unlocked: true },
    { id: "4", name: "Blue Tang", image: require("../../assets/fish/Bluetang.gif"), price: 100, fileName: "Bluetang.gif", rarity: "common", unlocked: true },
    { id: "5", name: "Cat Fish", image: require("../../assets/fish/Catfish.gif"), price: 100, fileName: "Catfish.gif", rarity: "rare", unlocked: true },
    { id: "6", name: "Goldfish", image: require("../../assets/fish/Goldfish.gif"), price: 100, fileName: "Goldfish.gif", rarity: "common", unlocked: true },
    { id: '7', name: '', image: require("../../assets/cat.gif"), price: '100', unlocked: false, requirement: { type: 'productivity', hours: 1 } },
    { id: '8', name: '', image: require("../../assets/cat.gif"), price: '100', unlocked: false, requirement: { type: 'productivity', hours: 5 } },
    { id: '9', name: '', image: require("../../assets/cat.gif"), price: '100', unlocked: false,requirement: { type: 'productivity', hours: 10 } },
    { id: '10', name: '', image: require("../../assets/cat.gif"), price: '100', unlocked: false, requirement: { type: 'productivity', hours: 24 } },
  ]);

  const [seashells, setSeashells] = useState(0);
  const [userFish, setUserFish] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userFishCounts, setUserFishCounts] = useState({});

  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const fetchUserProgress = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.error('User is not authenticated');
                return;
            }

            const progressDocRef = doc(firestoreDB, 'profile', userId, 'badges', 'badgeData');
            const progressDoc = await getDoc(progressDocRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data();
                console.log('Fetched user progress:', data);
                setUserProgress(data);
            } else {
                console.log('No progress data found in Firestore.');
            }
        } catch (error) {
            console.error('Error fetching user progress:', error);
        }
    };

    fetchUserProgress();
}, []);

useEffect(() => {
  const updatedItems = items.map((item) => {
    if (
      item.requirement?.type === "productivity" &&
      userProgress.totalMinutes >= item.requirement.hours * 60
    ) {
      return { ...item, unlocked: true };
    }
    return item;
  });

  // console.log("Updated Items:", updatedItems); // Debug to verify `unlocked` state
  setItems(updatedItems); // Update state with unlocked items
}, [userProgress]);


  // Fetch seashells and user fish
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;

        // Fetch seashells
        const userProfileRef = doc(firestoreDB, "profile", uid);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          setSeashells(userProfileSnap.data().seashells);
        }

        // Fetch fish
        const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
        const aquariumSnap = await getDoc(aquariumDocRef);
        if (aquariumSnap.exists()) {
          const data = aquariumSnap.data();
          const fishCounts = {};

          // Calculate fish counts from aquarium and storage
          (data.fish || []).forEach((fish) => {
            fishCounts[fish.name] = (fishCounts[fish.name] || 0) + 1;
          });
          (data.storageFish || []).forEach((fish) => {
            fishCounts[fish.name] = (fishCounts[fish.name] || 0) + (fish.count || 1);
          });

          setUserFishCounts(fishCounts);
        }
      }
    };

    fetchUserData();
  }, []);

  const handlePress = (item) => {
    if (!item.unlocked) {
      const requirementMessage = item.requirement?.type === 'productivity'
          ? `You need ${item.requirement.hours} hours of productivity to unlock this item.`
          : 'This item is locked.';
      Alert.alert('Locked Item', requirementMessage);
      return;
  }
    setSelectedItem(item);
    setIsModalVisible(true); // Open modal on item press
  };

  const closeModal = () => {
    setIsModalVisible(false); // Close modal
  };

  const handleBuy = async () => {
    if (!selectedItem) return;

    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;

      try {
        // Check if the user has enough seashells
        if (seashells < selectedItem.price) {
          Alert.alert("Insufficient Seashells", "You do not have enough seashells.");
          closeModal();
          return;
        }

        // Fetch aquarium data
        const aquariumDocRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
        const aquariumSnap = await getDoc(aquariumDocRef);

        if (!aquariumSnap.exists()) {
          Alert.alert("Error", "Aquarium data not found.");
          closeModal();
          return;
        }

        const aquariumData = aquariumSnap.data();
        const storageFish = aquariumData.storageFish || [];

        // Check if the fish already exists in storage
        const fishInStorage = storageFish.find((fish) => fish.name === selectedItem.name);

        if (fishInStorage) {
          // Enforce rarity and count rules
          if (selectedItem.rarity === "rare") {
            Alert.alert("Purchase Failed", "You can only own one rare fish.");
            closeModal();
            return;
          } else if (selectedItem.rarity === "common" && fishInStorage.count >= 5) {
            Alert.alert("Purchase Failed", "You can only own up to 5 of this common fish.");
            closeModal();
            return;
          }

          // Increment the count for the fish already in storage
          fishInStorage.count += 1;
        } else {
          // Add the new fish to storage
          storageFish.push({
            name: selectedItem.name,
            fileName: selectedItem.fileName,
            rarity: selectedItem.rarity,
            count: 1,
          });
        }

        // Deduct seashells
        const userProfileRef = doc(firestoreDB, "profile", uid);
        await updateDoc(userProfileRef, {
          seashells: seashells - selectedItem.price,
        });
        setSeashells(seashells - selectedItem.price);

        // Update the storageFish array in Firestore
        await updateDoc(aquariumDocRef, { storageFish });

        // Recalculate fish counts
        const updatedCounts = { ...userFishCounts };
        updatedCounts[selectedItem.name] = (updatedCounts[selectedItem.name] || 0) + 1;
        setUserFishCounts(updatedCounts);

        Alert.alert("Purchase Successful", `${selectedItem.name} has been added to your storage.`);
      } catch (error) {
        console.error("Error during purchase:", error);
        Alert.alert("Error", "An error occurred during the purchase. Please try again.");
      }

      closeModal();
    }
  };

  const renderItem = ({ item }) => {
    // Determine if the item is sold out
    const isSoldOut =
      (item.rarity === "rare" && (userFishCounts[item.name] || 0) >= 1) ||
      (item.rarity === "common" && (userFishCounts[item.name] || 0) >= 5);

    return (
      <View style={styles.itemContainer}>
      {/* Locked Overlay */}
      {!item.unlocked && (
        <TouchableOpacity
          style={styles.lockedOverlay}
          onPress={() => handlePress(item)} // Ensure this is triggered for locked items
        >
          <Text style={styles.lockedText}>Locked</Text>
        </TouchableOpacity>
      )}

        {isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
        <TouchableOpacity
          disabled={isSoldOut} // Disable TouchableOpacity for sold-out items
          onPress={() => handlePress(item)}
        >
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  

  return (
    <View style={styles.screen}>
      {/* Top buttons */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("HomeTabs")}>
          <Icon name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.shellCountContainer}>
          <Image source={require("../../assets/shell.png")} style={styles.shellButton} />
          <Text style={styles.shellCountText}>{seashells}</Text>
        </View>
      </View>

      {/* Header */}
      <Text style={styles.header}>SHOP</Text>

      {/* FlatList rendering */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.flatListRow}
        contentContainerStyle={styles.flatListContainer}
      />

      {/* Modal for item details */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalText}>{selectedItem.name}</Text>
                <Image source={selectedItem.image} style={styles.modalImage} />
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.closeButton} onPress={handleBuy}>
                <Text style={styles.closeButtonText}>Buy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#82D5FF",
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#82D5FF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  shellButton: {
    width: 50,
    height: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
    textAlign: "center",
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#FF9500",
    backgroundColor: "#FFFFCC",
    padding: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  flatListContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: "center",
  },
  flatListRow: {
    justifyContent: "space-between",
  },
  itemContainer: {
    flex: 1,
    marginVertical: 15,
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: "#FFFFCC",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#A0522D",
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    position: "relative", // Ensure relative positioning for overlay
    overflow: "hidden", // Prevent overlay from spilling out
  },
  
  itemImage: {
    width: 100,
    height: 100,
    zIndex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9500",
    borderWidth: 2,
    borderColor: "#FF9500",
    backgroundColor: "#FFDCA4",
    padding: 2,
    borderRadius: 5,
    textAlign: "center",
    width: 70,
    overflow: "hidden",
  },
  priceContainer: {
    alignSelf: "center",
    zIndex: 1,
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
  },
  modalText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
    color: "#FF9500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    alignContent: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#FF9500",
    backgroundColor: "#FFDCA4",
  },
  closeButtonText: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  shellCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shellCountText: {
    marginLeft: 5,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  soldOutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    zIndex: 2,
  },
  soldOutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    zIndex: 2,
  },
  lockedText: {
    color: "#FFFFFF", // White color
    fontWeight: "bold", // Bold font
    fontSize: 20, // Increase the font size
    textAlign: "center", // Center the text
    textTransform: "uppercase", // Optional: Make the text uppercase
    letterSpacing: 1.5, // Optional: Add spacing between letters
  },
  
  
});

export default StoreScreen;