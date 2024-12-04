import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SvgChart, SVGRenderer } from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import useStats from './useStats';

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  GridComponent,
  BarChart,
  SVGRenderer,
]);

const MyStatsScreen = ({ navigation }) => {
  const { stats, fetchStats,fetchWeeklyStats } = useStats();
  const [dailyChartData, setDailyChartData] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState(null);

  const dailyChartRef = useRef(null);
  const weeklyChartRef = useRef(null);
  const { width } = Dimensions.get('window');

  const categoryColors = {
    Other: '#5470C6', // Indigo
    Personal: '#91CC75', // Green
    Leisure: '#FAC858', // Yellow
    Study: '#EE6666', // Red
    Work: '#73C0DE', // Blue
    Fitness: '#FC8452', // Orange
    // Add more categories as needed
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats.daily && stats.daily.categoryBreakdown) {
      const categories = Object.keys(stats.daily.categoryBreakdown);
      const values = Object.values(stats.daily.categoryBreakdown);

      const pieChartData = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: 'bottom',
          left: 'center',
        },
        series: [
          {
            name: 'Time Logged',
            type: 'pie',
            radius: ['40%', '70%'],
            data: categories.map((category, index) => ({
              value: values[index],
              name: category,
              itemStyle: {
                color: categoryColors[category],
              }
            })),
          },
        ],
      };

      setDailyChartData(pieChartData);
    }
  }, [stats.daily]);

  useEffect(() => {
    if (dailyChartRef.current && dailyChartData) {

      const chart = echarts.init(dailyChartRef.current, null, {
        renderer: 'svg',
        width: width - 92, // adjust for padding
        height: 300,
      });
      chart.setOption(dailyChartData);
      return () => chart.dispose();
    }
  }, [dailyChartData]);

  useEffect(() => {
    const loadWeeklyStats = async () => {
      const stats = await fetchWeeklyStats();
      console.log("Fetched weeklyStats (loadWeeklyStats):", stats);
      setWeeklyStats(stats);
    };
  
    loadWeeklyStats();
  }, []);

  // useEffect(() => {
  //   if (weeklyStats && weeklyStats.categoryBreakdown) {
  //     const categories = Object.keys(weeklyStats.categoryBreakdown);
  //     const values = Object.values(weeklyStats.categoryBreakdown);
  
  //     // console.log("Weekly chart categories:", categories); // should be ["Leisure"]
  //     // console.log("Weekly chart values:", values); // should be [5]

  //     const pieChartData = {
  //       tooltip: {
  //         trigger: "item",
  //       },
  //       legend: {
  //         top: "bottom",
  //         left: "center",
  //       },
  //       series: [
  //         {
  //           name: "Weekly Time Logged",
  //           type: "pie",
  //           radius: ["40%", "70%"],
  //           data: categories.map((category, index) => ({
  //             value: values[index],
  //             name: category,
  //           })),
  //         },
  //       ],
  //     };

  //     console.log("Generated weeklyChartData:", pieChartData);
  //     setWeeklyChartData(pieChartData);
  //   }
  // }, [weeklyStats]);

  // useEffect(() => {
  //   if (weeklyChartRef.current && weeklyChartData) {
  //     const chart = echarts.init(weeklyChartRef.current, null, {
  //       renderer: 'svg',
  //       width: width - 92, // Adjust for padding
  //       height: 300,
  //     });
  
  //     chart.setOption(weeklyChartData); // Apply chart options
  //     console.log("Weekly chart initialized with data:", weeklyChartData); // Debug log
  //     return () => chart.dispose();
  //   }
  // }, [weeklyChartData]);

  useEffect(() => {
    if (weeklyStats && weeklyStats.categoryBreakdown) {
      //const days = Object.keys(weeklyStats.categoryBreakdown);
      const categories = Object.keys(weeklyStats.categoryBreakdown);
      const values = Object.values(weeklyStats.categoryBreakdown);

      const barChartData = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          top: 20,
          left: 50,
          right: 20,
          bottom: 50,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30, // Rotate labels if necessary
          },
        },
        yAxis: {
          type: 'value',
          name: 'Time Logged (minutes)',
          nameGap: 40,
          nameLocation: 'middle',
          nameTextStyle: {
            fontSize: 12,
          }
        },
        series: [
          {
            data: categories.map((category, index) => ({
              value: values[index],
              itemStyle: {
              color: categoryColors[category],
              },
            })),
            type: 'bar',
            
          },
        ],
      };
  
      setWeeklyChartData(barChartData);
    }
  }, [weeklyStats]);
  
  useEffect(() => {
    if (weeklyChartRef.current && weeklyChartData) {
      const chart = echarts.init(weeklyChartRef.current, null, {
        renderer: "svg",
        width: width - 92,
        height: 300,
      });
  
      chart.setOption(weeklyChartData);
      return () => chart.dispose();
    }
  }, [weeklyChartData]);
  
  
  
  

  return (
    <ScrollView style={styles.mainContainer}>
      <Text style={styles.statsTitle}>My Stats</Text>
      <Text style={styles.sectionTitle}>Daily Stats</Text>
      {dailyChartData ? (
        <View style={styles.chartContainer}>
          <SvgChart ref={dailyChartRef} />
        </View>
      ) : (
        <Text style={styles.noDataText}>No data available for today.</Text>
      )}
      <Text style={styles.sectionTitle}>Weekly Stats</Text>
      {weeklyChartData ? (
      <View style={styles.chartContainer}>
        <SvgChart ref={weeklyChartRef} />
      </View>
      ) : (
      <Text style={styles.noDataText}>No data available for this week.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 46,
    backgroundColor: '#fff',
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  chartContainer: {
    height: 300,
    width: '100%',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default MyStatsScreen;