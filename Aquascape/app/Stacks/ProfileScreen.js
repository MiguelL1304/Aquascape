import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Modal, FlatList } from "react-native";
import Colors from '../../constants/Colors';
import Elements from '../../constants/Elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from "@react-navigation/native";
import { auth, firestoreDB } from '../../firebase/firebase';
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const defaultProfilePic = require('../../assets/profilePics/defaultProfile.png');

const screenWidth = Dimensions.get('window').width;

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [status, setStatus] = useState(null);
  const [fishCount, setFishCount] = useState(0);
  const [badges, setBadges] = useState([]);
  const [badgeDetailsVisible, setBadgeDetailsVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const availableImages = [
    require('../../assets/profilePics/crabProfile.png'),
    require('../../assets/profilePics/seahorseProfile.png'),
    require('../../assets/profilePics/shrimpProfile.png'),
    require('../../assets/profilePics/squidProfile.png'),
    require('../../assets/profilePics/starfishProfile.png'),
  ];

  const availableBadges = [
        { title: "Lotus", description: "Complete 5 leisure tasks in a year", image: require("../../assets/lotus.png") },
        { title: "Conch", description: "Complete 5 personal tasks in a year", image: require("../../assets/Conch.png") },
        { title: "Starfish", description: "Complete 5 total tasks in a month", image: require("../../assets/starfish.png") },
        { title: "Coral", description: "Log 5 hours in a month", image: require("../../assets/coral.png") },
        { title: "Wave", description: "Complete 25 total tasks in a year", image: require("../../assets/wave.png") },
        { title: "Majesty", description: "Log 24 hours in a year", image: require("../../assets/prettyFish.png") },
        { title: "Power Crab", description: "Complete 3 fitness tasks in a month", image: require("../../assets/crab.png")},
        { title: "Gym Shark", description: "Complete 10 fitness tasks in a year", image: require("../../assets/workoutShark.png") },
        { title: "Nerd Fish", description: "Complete 5 study tasks in a month", image: require("../../assets/studyFish.png") },
        { title: "Book Fish", description: "Complete 15 study tasks in a year", image: require("../../assets/readFish.png") },
        { title: "Worker Whale", description: "Complete 3 work tasks in a month", image: require("../../assets/workingWhale.png") },
        { title: "Business Turtle", description: "Complete 8 work tasks in a year", image: require("../../assets/businessTurtle.png") },
    ];

  const formattedCreatedAt = userInfo?.createdAt 
    ? userInfo.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
    : "Date not available";

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserInfo = async () => {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const userDocRef = doc(firestoreDB, "profile", uid);
          const aquariumRef = doc(firestoreDB, "profile", uid, "aquarium", "data");
          const badgeRef = doc(firestoreDB, "profile", uid, "badges", "badgeData");
          try {
            const userSnap = await getDoc(userDocRef);
            const aquariumSnap = await getDoc(aquariumRef);
            const badgeSnap = await getDoc(badgeRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              // Convert Firestore Timestamp to JS Date
              if (userData.createdAt) {
                userData.createdAt = userData.createdAt.toDate();
              }
              // Set the status of user
              if (userData.status) {
                setStatus(userData.status);
              }
              // Only update if seashells count has changed
              if (!userInfo || userInfo.seashells !== userData.seashells) {
                setUserInfo(userData);
              }
              // Set the profile picture
              if (userData.profilePic) {
                setProfilePic(userData.profilePic);
              }
            } 

            // Update fish count
            if (aquariumSnap.exists()) {
              const aquariumData = aquariumSnap.data();
              const fish = aquariumData.fish || [];
              setFishCount(fish.length);
            }

            // Show user's earned badges
            if (badgeSnap.exists()) {
              const badgeData = badgeSnap.data();
              const earnedBadges = badgeData.earnedBadges || [];
              setBadges(earnedBadges);
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        }
      };
      fetchUserInfo();
    }, [userInfo])
  );

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  const handleImageSelect = async (image) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(firestoreDB, "profile", uid);

        // Update the profile picture in Firestore
        await updateDoc(userDocRef, {
          profilePic: image, 
        });

        setProfilePic(image);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating profile picture: ", error);
    }
  };

  const handleBadgePress = (badge) => {
    setSelectedBadge(badge);
    setBadgeDetailsVisible(true);
  };

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const { firstName, email, seashells, aquarium } = userInfo;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainContent}>
        {/* Profile Picture and Name */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={profilePic} 
            style={styles.profilePicture}
          />
          </TouchableOpacity>
          <Icon style={styles.pencilIcon} name="pencil" size={20} color={'black'} />
          </View>
          <Text style={styles.profileName}>{firstName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.createdAtLabel}>User since: {formattedCreatedAt}</Text>
          {status && <Text style={styles.statusLabel}>Status: {status}</Text>}
        </View>

        {/* Seashells */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Seashells:</Text>
          <Text style={styles.infoValue}>{seashells}</Text>
        </View>

        {/* Aquarium Overview */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Aquarium Fish:</Text>
          <Text style={styles.infoValue}>{fishCount}</Text>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {aquarium?.achievements?.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          ))}
          {aquarium?.achievements?.length === 0 && (
            <Text style={styles.noAchievements}>No achievements unlocked yet.</Text>
          )}

        {/* Display Badges */}
          <View style={styles.badgesContainer}>
            {badges.map((badgeTitle, index) => {
              // Find the badge in availableBadges array
              const badge = availableBadges.find((item) => item.title === badgeTitle);

              if (badge) {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleBadgePress(badge)}
                    style={styles.badgeItem}
                    >
                    <Image source={badge.image} style={styles.badgeImage} />
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                  </TouchableOpacity>
                );
              }

            return null;
          })}
          </View>
          </View>
        </View>

        <Modal visible={badgeDetailsVisible} animationType="fade" transparent={true}>
          <View style={styles.badgeModalContainer}>
            <View style={styles.badgeModalContent}>
              {selectedBadge && (
                <>
                  <Text style={styles.badgeModalTitle}>{selectedBadge.title}</Text>
                  <Text style={styles.badgeModalDescription}>{selectedBadge.description}</Text>
                  <Image source={selectedBadge.image} style={styles.badgeModalImage} />
                </>
              )}
              <TouchableOpacity
                style={[Elements.secondaryButton, styles.closeButton]}
                onPress={() => setBadgeDetailsVisible(false)}
              >
                <Text style={Elements.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[Elements.secondaryButton, styles.button]} onPress={handleLogout}>
          <Text style={Elements.secondaryButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    
    {/* Image Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Profile Picture</Text>
          <FlatList
            data={availableImages}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleImageSelect(item)}>
                <Image source={item} style={styles.modalImage} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            contentContainerStyle={styles.imageGrid}
          />
          <TouchableOpacity
            style={[Elements.secondaryButton, styles.closeButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={Elements.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 20, // To leave space at the bottom
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  createdAtLabel: {
    fontSize: 16,
    color: Colors.primary,
  },
  statusLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 5,
  },
  infoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  achievementsContainer: {
    width: "100%",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
  achievementItem: {
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noAchievements: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  button: {
    width: "70%",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  profilePictureContainer: {
    position: "relative", 
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pencilIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: Colors.background, 
    borderRadius: 15,
    padding: 2,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    marginTop: 100,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 20,
  },
  imageGrid: {
    alignItems: "center",
  },
  modalImage: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  closeButton: {
    marginBottom: 100,
  },
  badgesContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 10,
  justifyContent: "space-evenly",
  },
  badgeItem: {
    alignItems: "center",
    margin: 5,
  },
  badgeImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 25, 
    borderWidth: 2,
    resizeMode: "contain",
    borderColor: Colors.primary,
  },
  badgeTitle: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: "center",
  },
  badgeModalContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  badgeModalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary,
  },
  badgeModalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: Colors.textSecondary,
  },
  badgeModalImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
  },
});
