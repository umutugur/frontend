module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: reanimated@~3.17.x → plugin is 'react-native-reanimated/plugin'.
    // (react-native-worklets/plugin is only for reanimated v4.)
    // This plugin MUST be the LAST entry in the plugins array.
    plugins: ['react-native-reanimated/plugin'],
  };
};
