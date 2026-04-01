const { withPodfile } = require('@expo/config-plugins');

module.exports = function withFirebaseModularHeaders(config) {
  return withPodfile(config, (config) => {
    if (!config.modResults.contents.includes('use_modular_headers!')) {
      config.modResults.contents = config.modResults.contents.replace(
        /platform :ios, .*/,
        (match) => `${match}\nuse_modular_headers!`
      );
    }
    return config;
  });
};