const { withProjectBuildGradle } = require('@expo/config-plugins');
const path = require('path');

const withNotifee = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Use absolute path to ensure Gradle finds it
      const notifeePath = path.join(config._internal.projectRoot, 'node_modules/@notifee/react-native/android/libs');
      config.modResults.contents = addNotifeeRepository(config.modResults.contents, notifeePath);
    }
    return config;
  });
};

function addNotifeeRepository(buildGradle, notifeePath) {
  if (buildGradle.includes(notifeePath)) {
    return buildGradle;
  }

  const searchPattern = /allprojects\s*{\s*repositories\s*{/;
  const replacement = `allprojects {
    repositories {
        maven { url "${notifeePath}" }`;

  return buildGradle.replace(searchPattern, replacement);
}

module.exports = withNotifee;
