import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const Fish = ({ imageSource, positionX, positionY }) => {
  const offset = useSharedValue(positionX); // Starting position
  const scaleX = useSharedValue(1); // 1 for right-facing, -1 for left-facing

  useEffect(() => {
    const swimDistance = Math.min(screenWidth * 3, positionX + 500); // Max swim distance
    const swimDuration = Math.random() * 3000 + 3000; // Random duration for each fish

    // Define back-and-forth animation with flipping
    offset.value = withRepeat(
      withTiming(swimDistance, { duration: swimDuration }, (isFinished) => {
        // Instantly flip scaleX when direction changes
        if (isFinished) {
          scaleX.value *= -1; // Flip direction by toggling scaleX
        }
      }),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, [offset, positionX, scaleX]);

  // Create animated style for fish movement and instant flipping
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
          top: positionY,
          width: 100,
          height: 100,
        },
        animatedStyles,
      ]}
      resizeMode="contain"
    />
  );
};

export default Fish;
