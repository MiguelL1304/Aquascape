import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import { doc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { firestoreDB, auth } from "../../firebase/firebase";

import Colors from "../../constants/Colors";
import shell from "../../assets/shell.png";
import conch from "../../assets/Conch.png";
import starfish from "../../assets/starfish.png";
import cat from "../../assets/cat.gif";
import coral from "../../assets/coral.png";

const AchievementsScreen = () => {
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [shownAlerts, setShownAlerts] = useState([]); // Track badges with alerts shown
    const [userData, setUserData] = useState({});
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [status, setStatus] = useState({ name: "Newbie", image: cat });
    const [monthlyStats, setMonthlyStats] = useState({});
    const [yearlyStats, setYearlyStats] = useState({});

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthYearFormat = `${currentYear}-${currentMonth < 10 ? `0${currentMonth}` : currentMonth}`;

    const badges = [
        { title: "Coral", description: "Purchase 1 fish", image: coral },
        { title: "Conch", description: "Complete 10 tasks", image: conch },
        { title: "Starfish", description: "Complete 10 hours of productivity", image: starfish },
        { title: "Fitness task", description: "Complete 5 fitness tasks", image: cat },
    ];

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Firestore references
        const monthlyStatsRef = doc(firestoreDB, "profile", userId, "stats", "monthly");
        const yearlyStatsRef = doc(firestoreDB, "profile", userId, "stats", "yearly");
        const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");
        const userProfileRef = doc(firestoreDB, "profile", userId);

        // Real-time listeners
        const unsubscribeMonthly = onSnapshot(monthlyStatsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setMonthlyStats(data[monthYearFormat] || {});
            }
        });

        const unsubscribeYearly = onSnapshot(yearlyStatsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setYearlyStats(data[currentYear] || {});
            }
        });

        const unsubscribeBadges = onSnapshot(badgeDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEarnedBadges(data.earnedBadges || []);
                setShownAlerts(data.shownAlerts || []); // Sync shown alerts with Firestore
            } else {
                console.log("Badge document not found. Initializing...");
                await setDoc(badgeDocRef, {
                    earnedBadges: [],
                    shownAlerts: [],
                });
            }
        });

        const unsubscribeUserProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });

        return () => {
            unsubscribeMonthly();
            unsubscribeYearly();
            unsubscribeBadges();
            unsubscribeUserProfile();
        };
    }, []);

    const checkAndAwardBadges = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");

        const newBadges = [...earnedBadges];
        const newlyUnlocked = [];
        const newShownAlerts = [...shownAlerts];

        // Badge conditions
        if (monthlyStats.totalTimeLogged >= 600 && !newBadges.includes("Starfish")) {
            newBadges.push("Starfish");
            newlyUnlocked.push("Starfish");
        }
        if (yearlyStats.completedTasks >= 10 && !newBadges.includes("Coral")) {
            newBadges.push("Coral");
            newlyUnlocked.push("Coral");
        }
        if (monthlyStats.categoryBreakdown?.Fitness >= 5 && !newBadges.includes("Fitness task")) {
            newBadges.push("Fitness task");
            newlyUnlocked.push("Fitness task");
        }

        // Filter badges that haven't been alerted yet
        const badgesToAlert = newlyUnlocked.filter((badge) => !newShownAlerts.includes(badge));

        // Show alerts for newly unlocked badges
        badgesToAlert.forEach((badge) => {
            Alert.alert("Congratulations!", `You've earned the "${badge}" badge!`);
            newShownAlerts.push(badge); // Mark this badge's alert as shown
        });

        // Update Firestore with new badges and shown alerts
        if (newlyUnlocked.length > 0) {
            await updateDoc(badgeDocRef, {
                earnedBadges: newBadges,
                shownAlerts: newShownAlerts,
            });

            setEarnedBadges(newBadges); // Update local state
            setShownAlerts(newShownAlerts); // Update local state
        }
    };

    useEffect(() => {
        if (Object.keys(monthlyStats).length > 0 && Object.keys(yearlyStats).length > 0) {
            checkAndAwardBadges();
        }
    }, [monthlyStats, yearlyStats]); // Centralized trigger for badge checking

    const updateUserStatus = async () => {
        const badgeCount = earnedBadges.length;

        let newStatus;
        if (badgeCount >= 15) {
            newStatus = { name: "Neptune", image: starfish };
        } else if (badgeCount >= 10) {
            newStatus = { name: "Poseidon", image: conch };
        } else if (badgeCount >= 5) {
            newStatus = { name: "Percy", image: shell };
        } else {
            newStatus = { name: "Newbie", image: cat };
        }

        if (newStatus.name !== userData.status) {
            const userProfileRef = doc(firestoreDB, "profile", auth.currentUser?.uid);
            await updateDoc(userProfileRef, { status: newStatus.name });
            setStatus(newStatus); // Update local state
        }
    };

    useEffect(() => {
        if (earnedBadges.length > 0) {
            updateUserStatus();
        }
    }, [earnedBadges]);

    const handleBadgePress = (badge) => {
        setSelectedBadge(badge);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.username}>{userData.firstName || "User"}</Text>
                <View style={styles.shellContainer}>
                    <Image source={shell} style={styles.shellImage} />
                    <Text style={styles.shellCount}>{userData.seashells || 0}</Text>
                </View>
            </View>

            {/* Status */}
            <View style={styles.statusContainer}>
                <Image source={status.image} style={styles.statusImage} />
                <Text style={styles.statusText}>{status.name}</Text>
            </View>

            {/* Achievements */}
            <Text style={styles.headerText}>Achievements</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.badgeGrid}>
                    {badges.map((badge, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.badgeContainer}
                            onPress={() => handleBadgePress(badge)}
                        >
                            <Image source={badge.image} style={styles.badgeImage} />
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
                                    {earnedBadges.includes(selectedBadge.title)
                                        ? selectedBadge.description
                                        : `To unlock: ${selectedBadge.description}`}
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
    container: { flex: 1, paddingTop: 20, backgroundColor: Colors.theme.blue },
    header: { alignItems: "center", marginVertical: 10 },
    username: { fontSize: 24, fontWeight: "bold", color: Colors.primary },
    shellContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
    shellImage: { width: 30, height: 30, marginRight: 5 },
    shellCount: { fontSize: 16, fontWeight: "bold", color: Colors.white },
    statusContainer: { alignItems: "center", marginVertical: 20 },
    statusImage: { width: 120, height: 120, borderRadius: 60 },
    statusText: { fontSize: 20, fontWeight: "bold", color: Colors.primary, marginTop: 10 },
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
        paddingHorizontal: 30,
        alignSelf: "center",
        overflow: "hidden",
        marginVertical: 20,
    },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 10 },
    badgeContainer: { position: "relative", width: "30%", marginBottom: 15, alignItems: "center" },
    badgeImage: { width: 80, height: 80 },
    badgeName: { marginTop: 5, fontSize: 14, fontWeight: "bold", color: Colors.primary, textAlign: "center" },
    lockedOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    lockedText: { color: "white", fontWeight: "bold", fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContent: {
        backgroundColor: Colors.theme.yellow,
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 5,
        borderColor: Colors.theme.brown,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: Colors.theme.orange },
    modalImage: { width: 120, height: 120, marginBottom: 10 },
    modalDescription: { fontSize: 16, textAlign: "center", color: Colors.theme.brown },
    closeButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: Colors.theme.orange, borderRadius: 5 },
    closeButtonText: { color: Colors.white, fontWeight: "bold" },
});

export default AchievementsScreen;
