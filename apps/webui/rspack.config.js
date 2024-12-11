const { composePlugins, withNx, withReact } = require('@nx/rspack');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Exclude .wav files from being processed
  config.module.rules.push({
    test: /\.wav$/,
    type: 'asset/resource',
    generator: {
      emit: false,
    },
  });
  return config;
});
