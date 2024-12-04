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
import wave from "../../assets/wave.png";
import percy from "../../assets/percy.png";
import poseidon from "../../assets/poseidon.png";
import neptune from "../../assets/neptune.png";

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
        { title: "Lotus", description: "Complete 5 leisure tasks in a year", image: require("../../assets/lotus.png") },
        { title: "Conch", description: "Complete 5 personal tasks in a year", image: conch },
        { title: "Starfish", description: "Complete 5 total tasks in a month", image: starfish },
        { title: "Coral", description: "Log 5 hours in a month", image: coral },
        { title: "Wave", description: "Complete 25 total tasks in a year", image: wave },
        { title: "Majesty", description: "Log 24 hours in a year", image: require("../../assets/prettyFish.png") },
        { title: "Power Crab", description: "Complete 3 fitness tasks in a month", image: require("../../assets/crab.png")},
        { title: "Gym Shark", description: "Complete 10 fitness tasks in a year", image: require("../../assets/workoutShark.png") },
        { title: "Nerd Fish", description: "Complete 5 study tasks in a month", image: require("../../assets/studyFish.png") },
        { title: "Book Fish", description: "Complete 15 study tasks in a year", image: require("../../assets/readFish.png") },
        { title: "Worker Whale", description: "Complete 3 work tasks in a month", image: require("../../assets/workingWhale.png") },
        { title: "Business Turtle", description: "Complete 8 work tasks in a year", image: require("../../assets/businessTurtle.png") },
        // { title: "test", description: "earn 1 shell", image: require("../../assets/cat.gif")},
        // { title: "tester", description: "earn 501 shell", image: require("../../assets/cat.gif")}

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
                const data = docSnap.data();
                // Ensure that all expected fields are initialized correctly.
                const defaultUserData = {
                    seashells: 0, // Default value for seashells
                    ...data // Spread the existing data from Firestore
                };
                setUserData(defaultUserData);
            } else {
                console.log("User profile not found.");
                // Optionally set default user data if the document does not exist.
                setUserData({ seashells: 0 });
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
        if (!userId || shownAlerts.length === 0) return; // Wait for state to sync
    
        const badgeDocRef = doc(firestoreDB, "profile", userId, "badges", "badgeData");
    
        const newBadges = [...earnedBadges];
        const newlyUnlocked = [];
    
        // Badge conditions
        if (yearlyStats.categoryBreakdown?.Leisure >= 5 && !newBadges.includes("Lotus")) {
            newBadges.push("Lotus");
            newlyUnlocked.push("Lotus");
        }
        if (yearlyStats.categoryBreakdown?.Personal >= 5 && !newBadges.includes("Conch")) {
            newBadges.push("Conch");
            newlyUnlocked.push("Conch");
        }
        if (monthlyStats.completedTasks >= 5 && !newBadges.includes("Starfish")) {
            newBadges.push("Starfish");
            newlyUnlocked.push("Starfish");
        }
        if (monthlyStats.totalTimeLogged >= 300 && !newBadges.includes("Coral")) {
            newBadges.push("Coral");
            newlyUnlocked.push("Coral");
        }
        if (yearlyStats.completedTasks >= 25 && !newBadges.includes("Wave")) {
            newBadges.push("Wave");
            newlyUnlocked.push("Wave");
        }
        if (yearlyStats.totalTimeLogged >= 1440 && !newBadges.includes("Majesty")) {
            newBadges.push("Majesty");
            newlyUnlocked.push("Majesty");
        }
    
        // Filter badges to alert
        const badgesToAlert = newlyUnlocked.filter((badge) => !shownAlerts.includes(badge));
    
        // Show alerts for new badges
        for (const badge of badgesToAlert) {
            Alert.alert("Congratulations!", `You've earned the "${badge}" badge!`);
        }
    
        // Update Firestore and local state
        if (newlyUnlocked.length > 0) {
            await updateDoc(badgeDocRef, {
                earnedBadges: newBadges,
                shownAlerts: [...shownAlerts, ...badgesToAlert],
            });
    
            setEarnedBadges(newBadges);
            setShownAlerts([...shownAlerts, ...badgesToAlert]);
        }
    };
    
    
    

    useEffect(() => {
        if (
            Object.keys(monthlyStats).length > 0 &&
            Object.keys(yearlyStats).length > 0 &&
            shownAlerts.length >= 0 // Ensure `shownAlerts` is loaded
        ) {
            checkAndAwardBadges();
        }
    }, [monthlyStats, yearlyStats, shownAlerts]); // Depend on `shownAlerts` to avoid premature execution
    


    

    const updateUserStatus = async () => {
        const badgeCount = earnedBadges.length;

        let newStatus;
        if (badgeCount >= 12) {
            newStatus = { name: "Neptune", image: neptune };
        } else if (badgeCount >= 8) {
            newStatus = { name: "Poseidon", image: poseidon };
        } else if (badgeCount >= 4) {
            newStatus = { name: "Percy", image: percy };
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
