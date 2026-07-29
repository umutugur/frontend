module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // reanimated@4 ile worklet dönüşümü react-native-worklets'e taşındı;
    // 'react-native-reanimated/plugin' artık yok. Bu plugin dizinin SON
    // elemanı olmak zorunda.
    plugins: ['react-native-worklets/plugin'],
  };
};
