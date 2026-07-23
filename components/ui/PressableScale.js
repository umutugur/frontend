// components/ui/PressableScale.js
import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

/**
 * PressableScale — basınca hafifçe küçülen (0.97) dokunmatik sarmalayıcı.
 * Props: { onPress, children, style, disabled }
 * Layout stili (width/margin/shadow) DIŞTAKİ Pressable'a uygulanır; iç Animated.View
 * yalnızca scale transform taşır ve ebeveynini doldurur (stretch). Böylece
 * width:'100%' gibi stiller doğru propagate olur.
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
      style={style}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
