module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src'
          }
        }
      ],
      [
        'tamagui',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
