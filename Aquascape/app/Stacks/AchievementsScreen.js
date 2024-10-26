import { View, Text, StyleSheet, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import Colors from '../../constants/Colors'
import shell from  '../../assets/shell.png'

{/**
    * DRAW BADGES
    * CONNECT EACH BADGE TITLE WITH TASKS/HOURS
    * MOVE EARNED BADGES ABOVE NEXT TAB
 */}


const AchievementsScreen = () => {
    const [earnedBadges, setEarnedBadges] = useState(['Sea Shell']);

    const badges = [
        { title: 'Conch Shell', description: 'Complete 5 tasks', threshold: 5 },
        { title: 'Starfish', description: 'Complete 15 hours of study or work', threshold: 15 },
        { title: 'Mermaid', description: 'Complete 10 tasks and 25 hours of study or work', threshold: 10 },
    ];

    const handleTaskCompletion = (taskCount) => {
        badges.forEach(badge => {
            if (!earnedBadges.includes(badge.title) && taskCount >= badge.threshold) {
                setEarnedBadges(prev => [...prev, badge.title]);
                Alert.alert('Congratulations!', `You earned the ${badge.title} badge!`);
            }
        });
    };

    




  return (
    <View style={styles.container}>
            {/* Header */}
            <Text style={styles.header}>Achievements</Text>

            {/* Current Badge Status - Always shows "Sea Shell" as the starting badge */}
            <View style={styles.currentBadge}>
                <Image source={shell} style={styles.image} />
                <View>
                    <Text style={styles.badgeTitle}>Sea Shell</Text>
                    <Text style={styles.badgeDescription}>This is your current badge status</Text>
                </View>
            </View>

            {/* Earned Badges Above Next Up */}
            {earnedBadges.slice(1).map((badge, index) => ( // Start from second item in earnedBadges to skip "Sea Shell"
                <View key={index} style={styles.futureBadge}>
                    <Image source={shell} style={styles.image} />
                    <View>
                        <Text style={styles.badgeTitle}>{badge}</Text>
                        <Text style={styles.badgeDescription}>Description for {badge}</Text>
                    </View>
                </View>
            ))}

            {/* Next Up Tab */}
            <View style={styles.nextTab}>
                <View style={styles.tab}>
                    <Text style={styles.tabText}>Next up...</Text>
                </View>
            </View>

            {/* Future Badge Status */}
            {badges.filter(badge => !earnedBadges.includes(badge.title)).map((badge, index) => (
                <View key={index} style={styles.futureBadge}>
                    <Image source={shell} style={styles.image} />
                    <View>
                        <Text style={styles.badgeTitle}>{badge.title}</Text>
                        <Text style={styles.badgeDescription}>{badge.description}</Text>
                    </View>
                </View>
            ))}
        </View>
    // <View style={styles.container}>
    //     {/* Header */}
    //     <Text style={styles.header}>achievements</Text>

    //     {/* Current Badge Status */}
    //     <View style={styles.currentBadge}>
    //         <Image
    //             source={shell}
    //             style={styles.image}
    //         />
    //         <View>
    //             <Text style={styles.badgeTitle}>Sea Shell</Text>
    //             <Text style={styles.badgeDescription}>This is your current badge status</Text>
    //         </View>
    //     </View>
        
    //     {/* Next Up Tab */}
    //     <View style={styles.nextTab}>
    //     <View style={styles.tab}>
    //         <Text style={styles.tabText}>Next up...</Text>
    //     </View>
    //     </View>

    //     {/* Future Badge Status */}
    //     <View style={styles.futureBadge}>
    //         <Image
    //             source={shell}
    //             style={styles.image}
    //         />
    //         <View>
    //             <Text style={styles.badgeTitle}>Conch Shell</Text>
    //             <Text style={styles.badgeDescription}>Complete 5 tasks</Text>
    //         </View>
    //     </View>

    //     <View style={styles.futureBadge}>
    //         <Image
    //             source={shell}
    //             style={styles.image}
    //         />
    //         <View>
    //             <Text style={styles.badgeTitle}>Starfish</Text>
    //             <Text style={styles.badgeDescription}>Complete 15 hours of study or work</Text>
    //         </View>
    //     </View>

    //     <View style={styles.futureBadge}>
    //         <Image
    //             source={shell}
    //             style={styles.image}
    //         />
    //         <View>
    //             <Text style={styles.badgeTitle}>Mermaid</Text>
    //             <Text style={styles.badgeDescription} numberOfLines={2}>Complete 10 tasks and 25 hours of study or work</Text>
    //         </View>
    //     </View>


    // </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 90,
        alignItems: 'center',
        backgroundColor: Colors.theme.blue,
      },
      header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF9500',
        textAlign: 'center',
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        backgroundColor: Colors.theme.yellow,
        padding: 10,
        overflow: 'hidden',
        marginTop: 15,
        marginBottom: 30,
        width: '90%',
      },
      badgeDescription: {
        fontSize: 14,
        color: Colors.theme.brown,
        marginTop: 4,
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: '90%',
        
      },
      badgeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.theme.brown,
    },
      currentBadge: {
        flexDirection: 'row',
        backgroundColor: Colors.theme.yellow,
        padding: 10,
        paddingBottom: 30,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        marginBottom: 50,
        marginTop: 30,
        width: '90%',
      },
      futureBadge: {
        flexDirection: 'row',
        backgroundColor: Colors.theme.yellow,
        padding: 10,
        // paddingBottom: 400,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        // marginBottom: 10,
        marginTop: 20,
        width: '90%',
      },
      image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,  
    },
    tab: {
        backgroundColor: Colors.theme.yellow,
        padding: 6,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        // marginBottom: 10,
        // marginTop: 30,
        width: '50%', // Set a width that looks good
        alignItems: 'flex-start', // Align text to the left
    },
    tabText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.theme.orange,
    },
    nextTab: {
        alignSelf: 'flex-start',
        paddingLeft: 20,
    },
  });

export default AchievementsScreen