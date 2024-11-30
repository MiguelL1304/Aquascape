import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { firestoreDB, auth } from "../../firebase/firebase";
import Colors from "../../constants/Colors";
import shell from "../../assets/shell.png";
import conch from "../../assets/Conch.png";
import starfish from "../../assets/starfish.png";
import cat from "../../assets/cat.gif";

const AchievementsScreen = () => {
    const [earnedBadges, setEarnedBadges] = useState(['Sea Shell']);
    const [userData, setUserData] = useState({});
    const [selectedBadge, setSelectedBadge] = useState(null); // Track selected badge for modal
    const [modalVisible, setModalVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // State to track if badge is locked

    const badges = [
        { title: 'Sea Shell', description: 'Thanks for using Aquascape!', image: shell },
        { title: 'Conch Shell', description: 'Be Productive for 1 hour', image: conch },
        { title: 'Starfish', description: 'Be Productive for 5 hours', image: starfish },
        { title: 'Task Master', description: 'Complete 5 tasks', image: cat },
        { title: 'Task Champion', description: 'Complete 10 tasks', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
        { title: 'Test', description: 'test', image: cat },
    ];

    useEffect(() => {
        const fetchEarnedBadges = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                const userProfileRef = doc(firestoreDB, 'profile', userId);
                const badgeDocRef = doc(firestoreDB, 'profile', userId, 'badges', 'badgeData');

                const [userProfileSnap, badgeDocSnap] = await Promise.all([
                    getDoc(userProfileRef),
                    getDoc(badgeDocRef),
                ]);

                if (userProfileSnap.exists()) {
                    setUserData(userProfileSnap.data());
                }

                const earnedBadgesFromFirestore = badgeDocSnap.exists()
                    ? badgeDocSnap.data()?.earnedBadges || []
                    : [];

                setEarnedBadges(earnedBadgesFromFirestore);
            } catch (error) {
                console.error('Error fetching badges:', error);
            }
        };

        fetchEarnedBadges();
    }, []);

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
                <Image source={cat} style={styles.statusImage} />
                <Text style={styles.statusText}>Status</Text>
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
