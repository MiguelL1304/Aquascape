import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons'; 

const StoreScreen = ({ navigation }) => { // 
  const items = [
    { id: '1', image: require("../../assets/Splash Animations/shark2.gif"), price: '100'},
    { id: '2', image: require("../../assets/clownfish.gif"), price: '100' },
    { id: '3', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '4', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '5', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '6', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '7', image: require("../../assets/crying cat.gif"), price: '100'},
    { id: '8', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '9', image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '10', image: require("../../assets/crying cat.gif"), price: '100' },
  ];

  const handlePress = (item) => {
    // console.log(`Pressed item with ID: ${item.id}`); 
    // You can navigate or perform any action here
    // For example: navigation.navigate('ItemDetailScreen', { itemId: item.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item)}>
      <Image source={item.image} style={styles.itemImage} />
      <Text style={styles.itemPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
    {/* Top buttons as a separate row */}
    <View style={styles.topRow}>
      {/* Back Button in top left */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeTabs')}>
        <Icon name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Shell Button in top right */}
      <TouchableOpacity style={styles.shellButton} onPress={() => console.log('Shell button pressed')}>
        <Text style={styles.shellButtonText}>Shells</Text>
      </TouchableOpacity>
    </View>

    {/* Header */}
    <Text style={styles.header}>SHOP</Text>

    {/* FlatList rendering below the fixed top row */}
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.flatListContainer}
    />
  </View>
  );
};



const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#82D5FF',
      paddingHorizontal: 20,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: 50, // Space for status bar
      paddingBottom: 10,
      backgroundColor: '#82D5FF',
      zIndex: 10, // Ensure it stays above the FlatList
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    backButtonText: {
      color: '#fff',
      marginLeft: 5,
      fontSize: 16,
    },
    shellButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    shellButtonText: {
      color: '#fff',
      marginLeft: 5,
      fontSize: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FF9500', // Header text color
      textAlign: 'center',
      borderRadius: 10,
      borderWidth: 4,
      borderColor: '#FF9500',
      backgroundColor: '#FFFFCC',
      padding: 10,
      overflow: 'hidden',
      marginBottom: 10,

    },
    flatListContainer: {
      paddingTop: 40, // Adjust to ensure space for both topRow and header
      paddingBottom: 20,
      alignItems: 'center',
      
    },
    itemContainer: {
      flex: 1,
      margin: 15,
      padding: 25,
      backgroundColor: '#FFFFCC',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      height: 150,
    },
    itemImage: {
      width: 100,
      height: 100,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FF9500',
      borderWidth: 2,
      borderColor: '#FF9500',
      backgroundColor: '#FFDCA4',
      padding: 2,
      borderRadius: 5,
      textAlign: 'center',
      width: 70,
      overflow: 'hidden',
    },
  });
  
    

  export default StoreScreen;