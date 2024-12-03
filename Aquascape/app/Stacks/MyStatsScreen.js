import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import { doc, getDoc, collection, writeBatch, increment } from 'firebase/firestore';
import { auth, firestoreDB } from "../../firebase/firebase";

export const updateTaskCount = async (uid, task, operation = "add") => {
    const category = task.category;

    const today = new Date(task.date);
    const year = today.getFullYear();
    const month = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const day = task.date; // YYYY-MM-DD format
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)

    const statsRef = collection(firestoreDB, "profile", uid, "stats");

    const batch = writeBatch(firestoreDB);

    // Daily stats
    const dailyRef = doc(statsRef, "daily");
    batch.set(
      dailyRef,
      {
        [day]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(operation === "add" ? 1 : -1),
        },
      },
      { merge: true }
    );

    // Weekly stats
    const weeklyRef = doc(statsRef, "weekly");
    batch.set(
      weeklyRef,
      {
        [weekStart.toISOString().split("T")[0]]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(operation === "add" ? 1 : -1),
        },
      },
      { merge: true }
    );

    // Monthly stats
    const monthlyRef = doc(statsRef, "monthly");
    batch.set(
      monthlyRef,
      {
        [month]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(operation === "add" ? 1 : -1),
        },
      },
      { merge: true }
    );

    // Yearly stats
    const yearlyRef = doc(statsRef, "yearly");
    batch.set(
      yearlyRef,
      {
        [year]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(operation === "add" ? 1 : -1),
        },
      },
      { merge: true }
    );

    await batch.commit();
    console.log("Task counts updated in stats!");
};

export const updateTimeLogged = async (uid, task, operation = "add") => {
    const duration = operation === "add" ? task.duration : -task.duration;
    const category = task.category;

    const today = new Date(task.date);
    const year = today.getFullYear();
    const month = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const day = task.date; // YYYY-MM-DD format
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const statsRef = collection(firestoreDB, "profile", uid, "stats");

    const batch = writeBatch(firestoreDB);

    // Daily stats
    const dailyRef = doc(statsRef, "daily");
    batch.set(
      dailyRef,
      {
        [day]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    // Weekly stats
    const weeklyRef = doc(statsRef, "weekly");
    batch.set(
      weeklyRef,
      {
        [weekStart.toISOString().split("T")[0]]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    // Monthly stats
    const monthlyRef = doc(statsRef, "monthly");
    batch.set(
      monthlyRef,
      {
        [month]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    // Yearly stats
    const yearlyRef = doc(statsRef, "yearly");
    batch.set(
      yearlyRef,
      {
        [year]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    await batch.commit();
    console.log("Time logged and completed tasks updated in stats!");
};

const MyStatsScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        daily: {},
        weekly: {},
        monthly: {},
        yearly: {},
    });
    
    useEffect(() => {
        fetchStats();
    }, []);
    
    const fetchStats = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error("User not authenticated.");
          return;
        }
    
        try {
          const statsRef = collection(firestoreDB, "profile", userId, "stats");
          const dailyDoc = await getDoc(doc(statsRef, "daily"));
          const weeklyDoc = await getDoc(doc(statsRef, "weekly"));
          const monthlyDoc = await getDoc(doc(statsRef, "monthly"));
          const yearlyDoc = await getDoc(doc(statsRef, "yearly"));
    
          setStats({
            daily: dailyDoc.exists() ? dailyDoc.data() : {},
            weekly: weeklyDoc.exists() ? weeklyDoc.data() : {},
            monthly: monthlyDoc.exists() ? monthlyDoc.data() : {},
            yearly: yearlyDoc.exists() ? yearlyDoc.data() : {},
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
    };
    
    return (
        <ScrollView style={styles.mainContainer}>
          <Text style={styles.statsTitle}>My Stats</Text>
          <Text>Daily Stats: {JSON.stringify(stats.daily, null, 2)}</Text>
          <Text>Weekly Stats: {JSON.stringify(stats.weekly, null, 2)}</Text>
          <Text>Monthly Stats: {JSON.stringify(stats.monthly, null, 2)}</Text>
          <Text>Yearly Stats: {JSON.stringify(stats.yearly, null, 2)}</Text>
        </ScrollView>
      );
    };
    
    const styles = StyleSheet.create({
      mainContainer: {
        flex: 1,
        padding: 46,
        backgroundColor: "#fff",
      },
      statsTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 16,
      },
    });
    


export default MyStatsScreen;