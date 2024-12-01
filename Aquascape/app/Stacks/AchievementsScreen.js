import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { doc, getDoc, updateDoc,setDoc, onSnapshot } from "firebase/firestore";
import { firestoreDB, auth } from "../../firebase/firebase";
import Colors from "../../constants/Colors";
import shell from "../../assets/shell.png";
import conch from "../../assets/Conch.png";
import starfish from "../../assets/starfish.png";
// import percy from "../../assets/percy.png"; // Percy status image
// import poseidon from "../../assets/poseidon.png"; // Poseidon status image
// import neptune from "../../assets/neptune.png"; // Neptune status image
import cat from "../../assets/cat.gif"; // Default status image
import coral from '../../assets/coral.png';

const AchievementsScreen = () => {
    const [earnedBadges, setEarnedBadges] = useState(['Coral']);
    const [userData, setUserData] = useState({});
    const [selectedBadge, setSelectedBadge] = useState(null); // Track selected badge for modal
    const [modalVisible, setModalVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // State to track if badge is locked
    const [status, setStatus] = useState({ name: "Newbie", image: cat }); // Default status

    const badges = [
        { title: 'Coral', description: 'Thanks for using Aquascape!', image: coral },
        { title: 'Conch Shell', description: '1 hour of productivity', image: conch },
        { title: 'Starfish', description: '5 hours of productivity', image: starfish },
        { title: 'Task Master', description: 'Complete 5 tasks', image: cat },
        { title: 'Task Champion', description: 'Complete 10 tasks', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;
    
                const userProfileRef = doc(firestoreDB, "profile", userId);
                const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");
    
                // Use Promise.all to fetch profile and badge data in parallel
                const [userProfileSnap, badgeDocSnap] = await Promise.all([
                    getDoc(userProfileRef),
                    getDoc(badgeDocRef),
                ]);
    
                if (userProfileSnap.exists()) {
                    const userData = userProfileSnap.data();
                    setUserData(userData);
                    // console.log("User data:", userData);
                }
    
                if (badgeDocSnap.exists()) {
                    const badgeData = badgeDocSnap.data();
                    setEarnedBadges(badgeData.earnedBadges || []);
                    console.log("Earned badges:", badgeData.earnedBadges);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, []);
    
    // Real-time listener for shells and badges
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
    
        const userProfileRef = doc(firestoreDB, "profile", userId);
        const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");
    
        const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });
    
        const unsubscribeBadges = onSnapshot(badgeDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setEarnedBadges(docSnap.data().earnedBadges || []);
            }
        });
    
        return () => {
            unsubscribeProfile();
            unsubscribeBadges();
        };
    }, []);
    
    

    useEffect(() => {
        const fetchEarnedBadges = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;
    
                const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");
                const badgeDocSnap = await getDoc(badgeDocRef);
    
                if (badgeDocSnap.exists()) {
                    const badgeData = badgeDocSnap.data();
                    const { totalMinutes = 0, earnedBadges = [] } = badgeData;
    
                    // Lock/Unlock badges based on conditions
                    const updatedBadges = [...earnedBadges];
                    if (totalMinutes >= 7 && !updatedBadges.includes("Coral")) {
                        updatedBadges.push("Coral");
                    }
    
                    setEarnedBadges(updatedBadges);
    
                    // Update Firestore if badges were added
                    if (JSON.stringify(updatedBadges) !== JSON.stringify(earnedBadges)) {
                        await updateDoc(badgeDocRef, { earnedBadges: updatedBadges });
                    }
                } else {
                    // Initialize badge data for new users
                    await setDoc(badgeDocRef, {
                        totalMinutes: 0,
                        earnedBadges: [],
                    });
                    console.log("Initialized badge data for new user.");
                }
            } catch (error) {
                console.error("Error fetching earned badges:", error);
            }
        };
    
        fetchEarnedBadges();
    }, []);
    
    
    
    useEffect(() => {
        const updateUserStatus = async () => {
            const badgeCount = earnedBadges.length;
    
            let newStatus;
            if (badgeCount >= 9) {
                newStatus = { name: "Neptune", image: starfish };
            } else if (badgeCount >= 6) {
                newStatus = { name: "Poseidon", image: conch };
            } else if (badgeCount >= 3) {
                newStatus = { name: "Percy", image: shell };
            } else {
                newStatus = { name: "Newbie", image: cat };
            }
    
            // Update the status locally
            setStatus(newStatus);
    
            // Update Firestore if necessary
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;
    
                const userProfileRef = doc(firestoreDB, "profile", userId);
    
                // Update Firestore only if the status has changed
                if (userData.status !== newStatus.name) {
                    await updateDoc(userProfileRef, { status: newStatus.name });
                    // console.log(`Status updated to ${newStatus.name}`);
                }
            } catch (error) {
                console.error("Error updating user status in Firestore:", error);
            }
        };
    
        // Trigger the status update whenever the earnedBadges array changes
        if (earnedBadges.length > 0) {
            updateUserStatus();
        }
    }, [earnedBadges, userData]);
    

    const handleBadgePress = (badge) => {
        setSelectedBadge(badge);
        setIsLocked(!earnedBadges.includes(badge.title)); // Check if badge is locked
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header with Name and Shell Count */}
            <View style={styles.header}>
                <Text style={styles.username}>{userData.firstName || 'User'}</Text>
                <View style={styles.shellContainer}>
                    <Image source={shell} style={styles.shellImage} />
                    <Text style={styles.shellCount}>{userData.seashells || 0}</Text>
                </View>
            </View>

            {/* Status Image and Text */}
            <View style={styles.statusContainer}>
                <Image source={status.image} style={styles.statusImage} />
                <Text style={styles.statusText}>{status.name}</Text>
            </View>

            <Text style={styles.headerText}>Achievements</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Earned Badges */}
                <View style={styles.badgeGrid}>
                    {badges.map((badge, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.badgeContainer}
                            onPress={() => handleBadgePress(badge)}
                        >
                            <Image source={badge.image} style={styles.badgeImage} />
                            {/* Locked Overlay */}
                            {!earnedBadges.includes(badge.title) && (
                                <View style={styles.lockedOverlay}>
                                    <Text style={styles.lockedText}>Locked</Text>
                                </View>
                            )}
                            <Text style={styles.badgeName}>{badge.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Badge Modal */}
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
                                <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
                                <Image source={selectedBadge.image} style={styles.modalImage} />
                                <Text style={styles.modalDescription}>
                                    {isLocked
                                        ? `To unlock: ${selectedBadge.description}`
                                        : selectedBadge.description}
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
        paddingTop: 20,
        backgroundColor: Colors.theme.blue,
    },
    header: {
        alignItems: "center",
        marginVertical: 10,
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
        width: 30,
        height: 30,
        marginRight: 5,
    },
    shellCount: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.white,
    },
    statusContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    statusImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    statusText: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.primary,
        marginTop: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.theme.orange,
        textAlign: "center",
        borderRadius: 10,
        borderWidth: 4,
        borderColor: Colors.theme.orange,
        backgroundColor: Colors.theme.yellow,
        paddingVertical: 10,
        paddingHorizontal: 30, // Adjust padding to control box size
        alignSelf: "center", // Center the box
        overflow: "hidden",
        marginVertical: 20,
    },
    badgeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    badgeContainer: {
        position: "relative",
        width: "30%",
        marginBottom: 15,
        alignItems: "center",
    },
    badgeImage: {
        width: 80,
        height: 80,        
    },
    badgeName: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: "bold",
        color: Colors.primary,
        textAlign: "center",
    },
    lockedOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    lockedText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: Colors.theme.yellow,
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 5,
        borderColor: Colors.theme.brown,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors.theme.orange,
    },
    modalImage: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        textAlign: "center",
        color: Colors.theme.brown,
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.theme.orange,
        borderRadius: 5,
    },
    closeButtonText: {
        color: Colors.white,
        fontWeight: "bold",
    },
});

export default AchievementsScreen;
