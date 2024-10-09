import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../../../firebase/firebase';
import { TouchableOpacity } from "react-native-gesture-handler";

const AquariumScreen = ({ navigation }) => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);  
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.uidText}>User UID: {uid ? uid : 'No user logged in'}</Text>

      {/* Button to navigate to the StoreScreen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Store')} // Navigate to StoreScreen
      >
        <Text style={styles.buttonText}>Store</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uidText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#80C9FE',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AquariumScreen;
