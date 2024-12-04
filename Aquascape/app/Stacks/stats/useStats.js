// Path: ../../../hooks/useStats.js

import { useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  writeBatch,
  increment,
  updateDoc,
} from "firebase/firestore";
import { auth, firestoreDB as db } from "../../../firebase/firebase";

const useStats = () => {
  const [stats, setStats] = useState({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {},
  });

  const userId = auth.currentUser?.uid;



  // FETCH ALL STATS
  // const fetchStats = async () => {
  //   if (!userId) {
  //     console.error("User not authenticated.");
  //     return;
  //   }


  //   try {
  //     const statsRef = collection(db, "profile", userId, "stats");
  //     const dailyDoc = await getDoc(doc(statsRef, "daily"));
  //     const weeklyDoc = await getDoc(doc(statsRef, "weekly"));
  //     const monthlyDoc = await getDoc(doc(statsRef, "monthly"));
  //     const yearlyDoc = await getDoc(doc(statsRef, "yearly"));

  //     setStats({
  //       daily: dailyDoc.exists() ? dailyDoc.data() : {},
  //       weekly: weeklyDoc.exists() ? weeklyDoc.data() : {},
  //       monthly: monthlyDoc.exists() ? monthlyDoc.data() : {},
  //       yearly: yearlyDoc.exists() ? yearlyDoc.data() : {},
  //     });
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //   }
  // };

  const fetchStats = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }
  
    const statsRef = doc(db, "profile", userId, "stats", "daily");
    const currentDate = new Date().toISOString().split("T")[0]; // e.g., "2024-12-04"
  
    try {
      const dailySnapshot = await getDoc(statsRef);
  
      if (dailySnapshot.exists()) {
        const data = dailySnapshot.data();
        const todayStats = data[currentDate] || { categoryBreakdown: {}, totalTimeLogged: 0 };
  
        console.log("Fetched daily stats for today:", todayStats);
  
        // Set only today's stats in `stats.daily`
        setStats((prev) => ({
          ...prev,
          daily: todayStats,
        }));
      } else {
        console.log("No stats found for today.");
        setStats((prev) => ({
          ...prev,
          daily: { categoryBreakdown: {}, totalTimeLogged: 0 },
        }));
      }
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  };
  



  // FETCH *DAILY* STATS
  const fetchDailyStats = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const statsRef = collection(db, "profile", userId, "stats");
      const dailyDoc = await getDoc(doc(statsRef, "daily"));
      const currentDate = new Date().toISOString().split("T")[0];

      if (dailyDoc.exists()) {
        const data = dailyDoc.data();
        const todayStats = data[currentDate] || {};
        setStats((prevStats) => ({
          ...prevStats,
          daily: todayStats,
        }));
        console.log("Fetched daily stats", todayStats);
      } else {
        console.log("No stats found for today :( ");
        setStats((prevStats) => ({
          ...prevStats,
          daily: {},
        }));
      }
    } catch(error) {
      console.error("Error fetching daily stats:", error);
    }
  };

  const getWeekRange = (date) => {
    const day = date.getDate();
  
    if (day <= 7) return "1-7";
    if (day <= 14) return "8-14";
    if (day <= 21) return "15-21";
    if (day <= 28) return "22-28";
    return "29-end";
  };
  

  const fetchWeeklyStats = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }
  
    const statsRef = doc(db, "profile", userId, "stats", "weekly");
  
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const weekRange = getWeekRange(currentDate);
  
    try {
      const weeklySnapshot = await getDoc(statsRef);
  
      if (weeklySnapshot.exists()) {
        const data = weeklySnapshot.data();
        //console.log("Raw weekly data:", data);

        const thisWeekStats = data[month]?.[weekRange] || { categoryBreakdown: {}, totalTimeLogged: 0 };
        //console.log("Fetched this week's stats:", thisWeekStats); // Debug log
  
        console.log("Fetched weekly stats:", thisWeekStats);
        return thisWeekStats;
      } else {
        console.log("No weekly stats found.");
        return { categoryBreakdown: {}, totalTimeLogged: 0 };
      }
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      return { categoryBreakdown: {}, totalTimeLogged: 0 };
    }
  }

  // const updateTaskCount = async (task, operation = "add") => {
  //   if (!userId) {
  //     console.error("User not authenticated.");
  //     return;
  //   }

  //   const category = task.category;

  //   const today = new Date(task.date);
  //   const year = today.getFullYear();
  //   const month = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  //   const day = task.date; // YYYY-MM-DD format

  //   const weekStart = new Date(today);
  //   const dayOfWeek = today.getDay();
  //   const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday
  //   weekStart.setDate(today.getDate() + mondayOffset);

  //   const statsRef = collection(db, "profile", userId, "stats");

  //   const batch = writeBatch(db);

  //   // Batch updates
  //   batch.set(
  //     doc(statsRef, "daily"),
  //     {
  //       [day]: {
  //         taskCounts: increment(operation === "add" ? 1 : -1),
  //         [`categoryBreakdown.${category}`]: increment(
  //           operation === "add" ? 1 : -1
  //         ),
  //       },
  //     },
  //     { merge: true }
  //   );

  //   batch.set(
  //     doc(statsRef, "weekly"),
  //     {
  //       [weekStart.toISOString().split("T")[0]]: {
  //         taskCounts: increment(operation === "add" ? 1 : -1),
  //         [`categoryBreakdown.${category}`]: increment(
  //           operation === "add" ? 1 : -1
  //         ),
  //       },
  //     },
  //     { merge: true }
  //   );

  //   batch.set(
  //     doc(statsRef, "monthly"),
  //     {
  //       [month]: {
  //         taskCounts: increment(operation === "add" ? 1 : -1),
  //         [`categoryBreakdown.${category}`]: increment(
  //           operation === "add" ? 1 : -1
  //         ),
  //       },
  //     },
  //     { merge: true }
  //   );

  //   batch.set(
  //     doc(statsRef, "yearly"),
  //     {
  //       [year]: {
  //         taskCounts: increment(operation === "add" ? 1 : -1),
  //         [`categoryBreakdown.${category}`]: increment(
  //           operation === "add" ? 1 : -1
  //         ),
  //       },
  //     },
  //     { merge: true }
  //   );

  //   await batch.commit();
  //   console.log("Task counts updated in stats!");
  // };

  const updateTimeLogged = async (task, operation = "add") => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }
  
    const duration = operation === "add" ? task.duration : -task.duration;
    const category = task.category;
  
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const dateKey = currentDate.toISOString().split("T")[0];
    const month = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const weekRange = getWeekRange(currentDate);

    const dailyStatsRef = doc(db, "profile", userId, "stats", "daily");
    const weeklyStatsRef = doc(db, "profile", userId, "stats", "weekly");

    const batch = writeBatch(db);

    // Add or update daily stats
  batch.set(
    dailyStatsRef,
    {
      [dateKey]: {
        totalTimeLogged: increment(duration), // Increment total time logged
        categoryBreakdown: {
          [category]: increment(duration), // Increment category-specific time
        },
      },
    },
    { merge: true }
  );

  // Add or update weekly stats
  batch.set(
    weeklyStatsRef,
    {
      [month]: {
        [weekRange]: {
          totalTimeLogged: increment(duration), // Increment total time logged
          categoryBreakdown: {
            [category]: increment(duration), // Increment category-specific time
          },
        },
      },
    },
    { merge: true }
  );

  // Commit batch updates
  try {
    await batch.commit();
    console.log(`Time logged successfully for daily and weekly stats.`);
  } catch (error) {
    console.error("Error logging time:", error);
  }

    // batch.set(
    //   doc(statsRef, "weekly"),
    //   {
    //     [month]: {
    //       [weekRange]: {
    //         totalTimeLogged: increment(duration),
    //         categoryBreakdown: {
    //           [category]: increment(duration),
    //         },
    //       },
    //     },
    //   },
    //   { merge: true }
    // );

    // await batch.commit();
    // console.log(`Time logged successfully for weekly stats under ${month} -> ${weekRange}`)
  
    // try {
    //   // Dynamically update or create fields for the current date
    //   await setDoc(
    //     statsRef,
    //     {
    //       [currentDate]: {
    //         totalTimeLogged: increment(duration), // Update the total logged time
    //         categoryBreakdown: {
    //           [category]: increment(duration), // Update the category-specific time
    //         },
    //       },
    //     },
    //     { merge: true } // Merge updates with existing data
    //   );
  
    //   console.log(`Time logged successfully for ${category}: ${duration} minutes`);
    // } catch (error) {
    //   console.error("Error logging time:", error);
    // }
  };

  const updateStats = async (task, fromTasks = false) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated.");

      const statsRef = doc(db, "profile", userId, "stats", "summary");
      const statsSnap = await getDoc(statsRef);

      if (statsSnap.exists()) {
        const currentStats = statsSnap.data();
        const updatedStats = {
          totalTimeLogged: (currentStats.totalTimeLogged || 0) + task.duration,
          [`categoryBreakdown.${task.category}`]:
            (currentStats.categoryBreakdown?.[task.category] || 0) +
            task.duration,
        };

        // Increment `completedTasks` only if fromTasks is true
        if (fromTasks) {
          updatedStats.completedTasks = (currentStats.completedTasks || 0) + 1;
        }

        await updateDoc(statsRef, updatedStats);
        console.log("Stats document updated:", updatedStats);
      } else {
        const newStats = {
          totalTimeLogged: task.duration,
          categoryBreakdown: {
            [task.category]: task.duration,
          },
        };

        // Include `completedTasks` only if fromTasks is true
        if (fromTasks) {
          newStats.completedTasks = 1;
        }

        await setDoc(statsRef, newStats);
        console.log("Stats document created:", newStats);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  const markTaskAsComplete = async (task) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated.");

      console.log(`Marking task "${task.title}" as complete...`);

      const [year, month, day] = task.date.split("-");
      const monthKey = `${year}-${month}`;
      const weekTag =
        parseInt(day, 10) <= 7
          ? "1-7"
          : parseInt(day, 10) <= 14
          ? "8-14"
          : parseInt(day, 10) <= 21
          ? "15-21"
          : parseInt(day, 10) <= 28
          ? "22-28"
          : "29-end";

      const tasksDocRef = doc(db, "profile", userId, "tasks", monthKey);
      const tasksSnap = await getDoc(tasksDocRef);

      if (tasksSnap.exists()) {
        const weekTasks = tasksSnap.data()[weekTag] || [];
        const updatedWeekTasks = weekTasks.map((taskItem) =>
          taskItem.id === task.id ? { ...taskItem, completed: true } : taskItem
        );

        await updateDoc(tasksDocRef, {
          [weekTag]: updatedWeekTasks,
        });

        console.log("Task successfully marked as complete!");
      } else {
        console.error("Task document doesn't exist.");
      }
    } catch (error) {
      console.error("Error marking task as complete:", error);
    }
  };

  return {
    stats,
    fetchStats,
    updateTimeLogged,
    updateStats,
    markTaskAsComplete,
    fetchDailyStats,
    //updateTaskCount,
    fetchWeeklyStats,
    getWeekRange,
  };
};

export default useStats;
