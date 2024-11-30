import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Colors from '../../constants/Colors';
import Elements from '../../constants/Elements';
import { auth, firestoreDB } from '../../firebase/firebase';
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const defaultProfilePic = require('../../assets/starfish.png'); // Placeholder profile pic

const screenWidth = Dimensions.get('window').width;

const SettingsScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(firestoreDB, "profile", uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserInfo(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture and Name */}
      <View style={styles.profileHeader}>
        <Image
          source={defaultProfilePic} // Replace with dynamic profile pic if available
          style={styles.profilePicture}
        />
        <Text style={styles.profileName}>{firstName}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      {/* Seashells */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Seashells:</Text>
        <Text style={styles.infoValue}>{seashells}</Text>
      </View>

      {/* Aquarium Overview */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Aquarium Fish:</Text>
        <Text style={styles.infoValue}>{aquarium?.fish?.length || 0}</Text>
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
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[Elements.secondaryButton, styles.button]} onPress={handleLogout}>
          <Text style={Elements.secondaryButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 20,
    alignItems: "center",
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
  buttonContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
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
});
