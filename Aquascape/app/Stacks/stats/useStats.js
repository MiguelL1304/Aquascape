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

  const fetchStats = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const statsRef = collection(db, "profile", userId, "stats");
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

  const updateTaskCount = async (task, operation = "add") => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    const category = task.category;

    const today = new Date(task.date);
    const year = today.getFullYear();
    const month = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const day = task.date; // YYYY-MM-DD format

    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday
    weekStart.setDate(today.getDate() + mondayOffset);

    const statsRef = collection(db, "profile", userId, "stats");

    const batch = writeBatch(db);

    // Batch updates
    batch.set(
      doc(statsRef, "daily"),
      {
        [day]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(
            operation === "add" ? 1 : -1
          ),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "weekly"),
      {
        [weekStart.toISOString().split("T")[0]]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(
            operation === "add" ? 1 : -1
          ),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "monthly"),
      {
        [month]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(
            operation === "add" ? 1 : -1
          ),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "yearly"),
      {
        [year]: {
          taskCounts: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(
            operation === "add" ? 1 : -1
          ),
        },
      },
      { merge: true }
    );

    await batch.commit();
    console.log("Task counts updated in stats!");
  };

  const updateTimeLogged = async (task, operation = "add") => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    const duration = operation === "add" ? task.duration : -task.duration;
    const category = task.category;

    const today = new Date(task.date);
    const year = today.getFullYear();
    const month = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const day = task.date; // YYYY-MM-DD format

    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday
    weekStart.setDate(today.getDate() + mondayOffset);

    const statsRef = collection(db, "profile", userId, "stats");

    const batch = writeBatch(db);

    // Batch updates
    batch.set(
      doc(statsRef, "daily"),
      {
        [day]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "weekly"),
      {
        [weekStart.toISOString().split("T")[0]]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "monthly"),
      {
        [month]: {
          totalTimeLogged: increment(duration),
          completedTasks: increment(operation === "add" ? 1 : -1),
          [`categoryBreakdown.${category}`]: increment(duration),
        },
      },
      { merge: true }
    );

    batch.set(
      doc(statsRef, "yearly"),
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
    updateTaskCount,
    updateTimeLogged,
    updateStats,
    markTaskAsComplete,
  };
};

export default useStats;
