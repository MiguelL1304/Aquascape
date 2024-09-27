import React, { useState, useEffect } from "react";
import { View, Text } from 'react-native';
import { auth } from '../../../firebase/firebase';

export default function HomeScreen() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);  
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      
      <Text>User UID: {uid ? uid : 'No user logged in'}</Text>
      
    </View>
  );
}