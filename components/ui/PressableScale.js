// components/ui/PressableScale.js
import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PressableScale — basınca hafifçe küçülen (0.97) dokunmatik sarmalayıcı.
 * Props: { onPress, children, style, disabled }
 * Stil + transform + çocuklar TEK elemanda (AnimatedPressable) olduğundan hem
 * width:'100%' doğru propagate olur hem de flexDirection/justifyContent gibi
 * layout stilleri çocuklara uygulanır.
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
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
