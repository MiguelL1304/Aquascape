import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB as db, auth } from '../../firebase/firebase';
import Colors from '../../constants/Colors';
import shell from '../../assets/shell.png';
import conch from '../../assets/Conch.png';
import starfish from '../../assets/starfish.png';
// import mermaid from '../../assets/Mermaid.png';
import cat from '../../assets/cat.gif';


const AchievementsScreen = ({ route }) => {
    const [earnedBadges, setEarnedBadges] = useState(['Sea Shell']); // Initialize with the default badge

    useEffect(() => {
        fetchEarnedBadges(); // Fetch badges on component mount
    }, []);    



    const badges = [
        { title: 'Sea Shell', description: 'Thanks for using Aquascape!', image: shell },
        { title: 'Conch Shell', description: 'Be Productive for 1 hour', image: conch },
        { title: 'Starfish', description: 'Be Productive for 5 hours', image: starfish },
        // { title: 'Mermaid', description: 'Study for 24 hours', image: mermaid },
        { title: 'Test', description: 'testing', image: cat },
    ];

    const fetchEarnedBadges = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.error('User is not authenticated');
                return;
            }
    
            const badgeDocRef = doc(db, 'profile', userId, 'badges', 'badgeData');
            const badgeDoc = await getDoc(badgeDocRef);
    
            if (badgeDoc.exists()) {
                const data = badgeDoc.data();
                console.log('Fetched earned badges:', data.earnedBadges); // Log fetched badges
                setEarnedBadges(data.earnedBadges || ['Sea Shell']); // Set the state
            } else {
                console.log('No badge data found in Firestore.');
            }
        } catch (error) {
            console.error('Error fetching earned badges:', error);
        }
    };
    

    
    


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Achievements</Text>
            <ScrollView 
    contentContainerStyle={styles.scrollContainer} 
    style={styles.scrollView}
>
    {/* Display earned badges in order */}
    {badges.map((badge, index) => (
        earnedBadges.includes(badge.title) && (
            <View key={index} style={styles.earnedBadge}>
                <Image source={badge.image} style={styles.image} />
                <View>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
            </View>
        )
    ))}

    <View style={styles.nextTab}>
        <View style={styles.tab}>
            <Text style={styles.tabText}>Next up...</Text>
        </View>
    </View>

    {/* Display future badges not yet earned */}
    {badges
        .filter(badge => !earnedBadges.includes(badge.title))
        .map((badge, index) => (
            <View key={index} style={styles.futureBadge}>
                <Image source={badge.image} style={styles.image} />
                <View>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
            </View>
        ))}
</ScrollView>
     
        </View>
    );
};

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
      },
      badgeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.theme.brown,
    },
      earnedBadge: {
        flexDirection: 'row',
        backgroundColor: Colors.theme.yellow,
        padding: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        marginTop: 20,
        width: '90%',
      },
      futureBadge: {
        flexDirection: 'row',
        backgroundColor: Colors.theme.yellow,
        padding: 10,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        marginTop: 20,
        width: '90%',
      },
      image: {
        width: 70,
        height: 70,
        borderRadius: 25,
        marginRight: 10,  
    },
    tab: {
        backgroundColor: Colors.theme.yellow,
        padding: 6,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#FF9500',
        marginTop: 50,
        width: '50%',
        alignItems: 'flex-start',
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
    scrollView: {
        width: '100%', // Ensures the ScrollView takes up the full width
        flexGrow: 1,   // Allows the content to grow
    },
    scrollContainer: {
        paddingHorizontal: 20, // Adds some horizontal padding to the content
        paddingBottom: 20,     // Adds spacing at the bottom
    },
    
    
});

export default AchievementsScreen;
