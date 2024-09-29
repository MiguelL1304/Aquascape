import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

const SplashScreen = ({ navigation }) => {
  return (
    <Onboarding
      onSkip={() => navigation.replace("Login")}
      onDone={() => navigation.navigate("Login")}
      pages={[
        {
          backgroundColor: "#82D5FF",
          image: <Image source={require("../../assets/Splash Animations/bubbles.gif")}
          style={styles.image} />,
          title: "Welcome to Aquascape",
          subtitle: " ",
          titleStyles: styles.title, 
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: "#FFDCF4",
          image: <Image source={require("../../assets/Splash Animations/hourglass.gif")}
          style={styles.image} />,
          title: "Productivity",
          subtitle: "Set a timer to stay focused and be productive ",
          titleStyles: styles.title, 
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: "#FFFFAA",
          image: <Image source={require("../../assets/Splash Animations/checklist.gif")}
          style={styles.image} />,
          title: "Habit Tracking",
          subtitle: "Keep track of your habits and daily goals",
          titleStyles: styles.title, 
          subTitleStyles: styles.subtitle,
       
        },
        {
          backgroundColor: "#80C9FE",
          image: <Image source={require("../../assets/Splash Animations/shark2.gif")} 
          style={styles.image}/>,
          title: "Customizable Aquarium",
          subtitle: "Collect sea creatures and decor to fill up your tank",
          titleStyles: styles.title, 
          subTitleStyles: styles.subtitle,
        },
      ]}
    />
  ); 
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 250,  
    height: 250,  
    resizeMode: "contain",  
  },
  title: {
    color: "#FFFFFF",  
    fontSize: 28,   
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: '#000000',      // Shadow color (black)
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 4,            
  },
  subtitle: {
    color: "#FFFFFF",  
    textAlign: "center",
    textShadowColor: '#000000',   
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2,            
  },
});