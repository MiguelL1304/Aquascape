import React, { useEffect, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

const Fish = ({ imageSource, positionX, positionY, aquariumWidth, aquariumHeight }) => {
  const offset = useSharedValue(positionX); // Starting position
  const scaleX = useSharedValue(1); // 1 for right-facing, -1 for left-facing

  const resetAnimation = useCallback(() => {
    // Ensure the fish starts swimming within the aquarium's horizontal bounds
    offset.value = positionX;
    scaleX.value = 1; // Start facing right

    // Calculate maximum swim distance within aquarium bounds
    const maxSwimDistance = Math.min(aquariumWidth - 150, positionX + 500); // Restrict swim distance to within the aquarium width
    const swimDuration = Math.random() * 3000 + 5000; // Random duration for each fish

    // Define back-and-forth animation with flipping
    offset.value = withRepeat(
      withTiming(maxSwimDistance, { duration: swimDuration }, (isFinished) => {
        if (isFinished) {
          // Flip direction by toggling scaleX
          scaleX.value *= -1;
        }
      }),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, [offset, positionX, scaleX, aquariumWidth]);

  // Use focus effect to reset animation each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      resetAnimation();
    }, [resetAnimation])
  );

  // Create animated style for fish movement and flipping
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { scaleX: scaleX.value },
    ],
  }));

  return (
    <Animated.Image
      source={imageSource}
      style={[
        {
          position: 'absolute',
          top: Math.min(positionY, aquariumHeight - 150), // Ensure Y position stays within aquarium height bounds
          width: 150,
          height: 150,
        },
        animatedStyles,
      ]}
      resizeMode="contain"
    />
  );
};

export default Fish;
