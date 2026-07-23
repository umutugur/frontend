// components/ui/PressableScale.js
import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

/**
 * PressableScale — basınca hafifçe küçülen (0.97) dokunmatik sarmalayıcı.
 * Props: { onPress, children, style, disabled }
 */
export default function PressableScale({ onPress, children, style, disabled = false, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
