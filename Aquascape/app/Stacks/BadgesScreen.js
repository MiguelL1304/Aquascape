// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
// import { doc, getDoc } from "firebase/firestore";
// import { firestoreDB, auth } from "../../firebase/firebase";
// import Colors from "../../constants/Colors";
// import cat from "../../assets/cat.gif";
// import shell from "../../assets/shell.png";

// const BadgesScreen = () => {
//   const [badges, setBadges] = useState([]);
//   const [userData, setUserData] = useState({});
//   const [selectedBadge, setSelectedBadge] = useState(null); // Track selected badge for modal
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userId = auth.currentUser?.uid;
//         if (!userId) return;
  
//         // Fetch user profile data
//         const userDocRef = doc(firestoreDB, "profile", userId);
//         const userSnapshot = await getDoc(userDocRef);
  
//         if (userSnapshot.exists()) {
//           const userData = userSnapshot.data();
//           setUserData(userData); // Set user data
//         } else {
//           console.log("User profile data not found.");
//         }
  
//         // Fetch achievements (badges)
//         const badgeDocRef = doc(firestoreDB, "profile", userId, "achievements", "data");
//         const badgeDoc = await getDoc(badgeDocRef);
  
//         if (badgeDoc.exists()) {
//           const badgeData = badgeDoc.data();
//           setBadges(badgeData.achievements || []); // Update the badges state
//         } else {
//           console.log("No achievements found for this user.");
//         }
//       } catch (error) {
//         console.error("Error fetching user data and achievements:", error);
//       }
//     };
  
//     fetchUserData();
//   }, []);
  

//   const handleBadgePress = (badge) => {
//     setSelectedBadge(badge);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//   };

  

//   return (
//     <View style={styles.container}>
//       {/* Static Header Section */}
//       <View style={styles.header}>
//         <Text style={styles.username}>
//           {userData.firstName ? `${userData.firstName}` : "User"}
//         </Text>
//         <View style={styles.shellContainer}>
//           <Image source={shell} style={styles.shellImage} />
//           <Text style={styles.shellCount}>{userData.seashells || 0}</Text>
//         </View>
//       </View>

//       {/* Static Emblems Section */}
//       <View style={styles.emblems}>
//         <Text style={styles.sectionTitle}>Emblems</Text>
//         <View style={styles.emblemRow}>
//           <Image source={cat} style={styles.emblemImage} />
//           <Image source={cat} style={styles.emblemImage} />
//           <Image source={cat} style={styles.emblemImage} />
//         </View>
//       </View>

//       {/* Scrollable Achievements Section */}
//       <View style={styles.achievements}>
//         <Text style={styles.sectionTitle}>Achievements</Text>
//         <ScrollView contentContainerStyle={styles.achievementGrid}>
//           {badges.length > 0 ? (
//             badges.map((badge, index) => (
//               <TouchableOpacity
//                 style={styles.badgeContainer}
//                 key={index}
//                 onPress={() => handleBadgePress(badge)}
//               >
//                 <Image source={cat} style={styles.badgeImage} />
//                 <Text style={styles.badgeName}>{badge.name || "Badge"}</Text>
//               </TouchableOpacity>
//             ))
//           ) : (
//             // Placeholder for testing
//             Array(12)
//               .fill(null)
//               .map((_, index) => (
//                 <TouchableOpacity
//                   style={styles.badgeContainer}
//                   key={index}
//                   onPress={() =>
//                     handleBadgePress({ name: `Badge ${index + 1}`, reason: "Earned by studying for 1 hour" })
//                   }
//                 >
//                   <Image source={cat} style={styles.badgeImage} />
//                   <Text style={styles.badgeName}>Badge {index + 1}</Text>
//                 </TouchableOpacity>
//               ))
//           )}
//         </ScrollView>
//       </View>

//       {/* Modal for Badge Details */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={closeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             {selectedBadge && (
//               <>
//                 <Text style={styles.modalTitle}>{selectedBadge.name || "Badge"}</Text>
//                 <Image source={cat} style={styles.modalImage} />
//                 <Text style={styles.modalReason}>
//                   {selectedBadge.reason || "Earned by studying for 1 hour"}
//                 </Text>
//               </>
//             )}
//             <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { firestoreDB, auth } from "../../firebase/firebase";
import Colors from "../../constants/Colors";
import cat from "../../assets/cat.gif";
import shell from "../../assets/shell.png";

const BadgesScreen = () => {
  const [badges, setBadges] = useState([]);
  const [userData, setUserData] = useState({});
  const [selectedBadge, setSelectedBadge] = useState(null); // Track selected badge for modal
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // Get navigation object

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
  
        // Fetch user profile data
        const userDocRef = doc(firestoreDB, "profile", userId);
        const userSnapshot = await getDoc(userDocRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData); // Set user data
        } else {
          console.log("User profile data not found.");
        }
  
        // Fetch achievements (badges)
        const badgeDocRef = doc(firestoreDB, "profile", userId, "achievements", "data");
        const badgeDoc = await getDoc(badgeDocRef);
  
        if (badgeDoc.exists()) {
          const badgeData = badgeDoc.data();
          setBadges(badgeData.achievements || []); // Update the badges state
        } else {
          console.log("No achievements found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user data and achievements:", error);
      }
    };
  
    fetchUserData();
  }, []);

  const handleBadgePress = (badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Static Header Section */}
      <View style={styles.header}>
        <Text style={styles.username}>
          {userData.firstName ? `${userData.firstName}` : "User"}
        </Text>
        <View style={styles.shellContainer}>
          <Image source={shell} style={styles.shellImage} />
          <Text style={styles.shellCount}>{userData.seashells || 0}</Text>
        </View>
      </View>

      {/* Static Emblems Section */}
      <View style={styles.emblems}>
        <Text style={styles.sectionTitle}>Emblems</Text>
        <View style={styles.emblemRow}>
          <Image source={cat} style={styles.emblemImage} />
          <Image source={cat} style={styles.emblemImage} />
          <Image source={cat} style={styles.emblemImage} />
        </View>
      </View>

      {/* Navigate to Achievements Screen */}
      <TouchableOpacity onPress={() => navigation.navigate("Achievements")}>
        <Text style={styles.sectionTitleButton}>Achievements</Text>
      </TouchableOpacity>

      {/* Scrollable Achievements Section */}
      <View style={styles.achievements}>
        <ScrollView contentContainerStyle={styles.achievementGrid}>
          {badges.length > 0 ? (
            badges.map((badge, index) => (
              <TouchableOpacity
                style={styles.badgeContainer}
                key={index}
                onPress={() => handleBadgePress(badge)}
              >
                <Image source={cat} style={styles.badgeImage} />
                <Text style={styles.badgeName}>{badge.name || "Badge"}</Text>
              </TouchableOpacity>
            ))
          ) : (
            // Placeholder for testing
            Array(12)
              .fill(null)
              .map((_, index) => (
                <TouchableOpacity
                  style={styles.badgeContainer}
                  key={index}
                  onPress={() =>
                    handleBadgePress({ name: `Badge ${index + 1}`, reason: "Earned by studying for 1 hour" })
                  }
                >
                  <Image source={cat} style={styles.badgeImage} />
                  <Text style={styles.badgeName}>Badge {index + 1}</Text>
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      </View>

      {/* Modal for Badge Details */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <>
                <Text style={styles.modalTitle}>{selectedBadge.name || "Badge"}</Text>
                <Image source={cat} style={styles.modalImage} />
                <Text style={styles.modalReason}>
                  {selectedBadge.reason || "Earned by studying for 1 hour"}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.theme.blue,
    },
    header: {
      alignItems: "center",
      marginVertical: 20,
    },
    username: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors.primary,
    },
    shellContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    shellImage: {
      width: 40,
      height: 40,
      marginRight: 5,
    },
    shellCount: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors.black,
    },
    emblems: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: Colors.white,
      textAlign: "center",
    },
    emblemRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
    },
    emblemImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
    },
    achievements: {
      flex: 1,
    },
    achievementGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: 10,
    },
    badgeContainer: {
      width: "30%", // Ensures 3 items per row
      aspectRatio: 1,
      marginBottom: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.theme.yellow,
      borderRadius: 10,
    },
    badgeImage: {
      width: "60%",
      height: "60%",
      resizeMode: "contain",
    },
    badgeName: {
      fontSize: 12,
      marginTop: 5,
      color: Colors.primary,
      textAlign: "center",
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
    modalTitle: {
      fontSize: 25,
      fontWeight: "bold",
      marginTop: 10,
      color: "#FF9500",
    },
    modalImage: {
      width: 150,
      height: 150,
    },
    modalReason: {
      fontSize: 16,
      color: "#000",
      marginTop: 10,
      textAlign: "center",
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
  });
  

export default BadgesScreen;
