import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const StoreScreen = ({ navigation }) => {
  const items = [
    { id: '1', name: 'Shark', image: require("../../assets/Splash Animations/shark2.gif"), price: '100' },
    { id: '2', name: 'Clownfish', image: require("../../assets/clownfish.gif"), price: '100' },
    { id: '3', name: 'Fisherman', image: require("../../assets/Fisherman.gif"), price: '100' },
    { id: '4', name: 'Sea Shell', image: require("../../assets/shell.png"), price: '100' },
    { id: '5', name: '',image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '6', name: '',image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '7', name: '',image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '8', name: '',image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '9', name: '',image: require("../../assets/crying cat.gif"), price: '100' },
    { id: '10',name: '',image: require("../../assets/crying cat.gif"), price: '100' },
  ];

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePress = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true); // Open modal on item press
  };

  const closeModal = () => {
    setIsModalVisible(false); // Close modal
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item)}>
      <Image source={item.image} style={styles.itemImage} />
      <Text style={styles.itemPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Top buttons */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeTabs')}>
          <Icon name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shellButton} onPress={() => console.log('Shell button pressed')}>
          <Image
            source={require('../../assets/shell.png')}
            style={styles.shellButton}
          />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Text style={styles.header}>SHOP</Text>

      {/* FlatList rendering */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.flatListRow} // Added to fix spacing between columns
        contentContainerStyle={styles.flatListContainer}
      />

      {/* Modal for item details */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalText}>{selectedItem.name}</Text>
                <Image source={selectedItem.image} style={styles.modalImage} />
              </>
            )}
            <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.closeButton} >
              <Text style={styles.closeButtonText}>Buy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#82D5FF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  shellButton: {
    width: 50,
    height: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
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
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  flatListRow: {
    justifyContent: 'space-between', // Ensures columns are evenly spaced
  },
  itemContainer: {
    flex: 1,
    marginVertical: 15,
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: '#FFFFCC',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#A0522D',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#FFFFCC',
    borderWidth: 8,
    borderColor: '#8B4513',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 150,
    height: 150,
  },
  modalText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF9500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    alignContent: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#FF9500',
    backgroundColor: '#FFDCA4',
  },
  closeButtonText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
});

export default StoreScreen;
