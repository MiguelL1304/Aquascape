import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useStats from "./useStats";

const MyStatsScreen = ({ navigation }) => {
    const { stats, fetchStats } = useStats();
    
    useEffect(() => {
        fetchStats();
    }, []);
    
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