const {
  withAndroidManifest,
  withInfoPlist,
  withDangerousMod,
  withMainApplication,
  withXcodeProject,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 1. iOS – Info.plist: Alternate Icons
// ─────────────────────────────────────────────
const withIosDynamicIcon = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.CFBundleIcons = {
      CFBundleAlternateIcons: {
        lightning: {
          CFBundleIconFiles: ['AppIcon-lightning'],
          UIPrerenderedIcon: false,
        },
        compass: {
          CFBundleIconFiles: ['AppIcon-compass'],
          UIPrerenderedIcon: false,
        },
      },
    };
    return config;
  });
};

// ─────────────────────────────────────────────
// 2. Android – AndroidManifest: Activity Aliases
// ─────────────────────────────────────────────
const withAndroidDynamicIcon = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    const mainActivity = mainApplication.activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Remove LAUNCHER intent-filter from MainActivity
      if (mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = mainActivity['intent-filter'].filter((filter) => {
          const isLauncher = filter.category?.some(
            (c) => c.$['android:name'] === 'android.intent.category.LAUNCHER'
          );
          return !isLauncher;
        });
      }

      // Clear existing aliases (idempotent)
      mainApplication['activity-alias'] = (mainApplication['activity-alias'] || []).filter(
        (a) => !['.MainActivityDefault', '.MainActivityLightning', '.MainActivityCompass'].includes(a.$['android:name'])
      );

      // Add Activity Aliases for each icon
      const aliases = [
        { name: '.MainActivityDefault',   enabled: 'true',  icon: '@mipmap/ic_launcher' },
        { name: '.MainActivityLightning', enabled: 'false', icon: '@mipmap/ic_launcher_lightning' },
        { name: '.MainActivityCompass',   enabled: 'false', icon: '@mipmap/ic_launcher_compass' },
      ];

      aliases.forEach((alias) => {
        mainApplication['activity-alias'].push({
          $: {
            'android:name': alias.name,
            'android:enabled': alias.enabled,
            'android:exported': 'true',
            'android:icon': alias.icon,
            'android:targetActivity': '.MainActivity',
          },
          'intent-filter': [
            {
              action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
              category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
            },
          ],
        });
      });
    }

    return config;
  });
};

// ─────────────────────────────────────────────
// 3. Android – Copy icon assets to res/mipmap
// ─────────────────────────────────────────────
const withIconAssets = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resDir = path.join(projectRoot, 'android/app/src/main/res');
      const iconLightning = path.join(projectRoot, 'assets/icon-lightning.png');
      const iconCompass = path.join(projectRoot, 'assets/icon-compass.png');

      const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];

      for (const mipmap of mipmaps) {
        const destDir = path.join(resDir, mipmap);
        if (fs.existsSync(destDir)) {
          fs.copyFileSync(iconLightning, path.join(destDir, 'ic_launcher_lightning.png'));
          fs.copyFileSync(iconCompass, path.join(destDir, 'ic_launcher_compass.png'));
        }
      }
      return config;
    },
  ]);
};

// ─────────────────────────────────────────────
// 4. Android – Copy AppIconModule.kt + AppIconPackage.kt
// ─────────────────────────────────────────────
const withAndroidNativeModule = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const destDir = path.join(projectRoot, 'android/app/src/main/java/com/swipee');
      const srcDir = path.join(projectRoot, 'plugins/native/android');

      fs.mkdirSync(destDir, { recursive: true });

      ['AppIconModule.kt', 'AppIconPackage.kt'].forEach((file) => {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });

      return config;
    },
  ]);
};

// ─────────────────────────────────────────────
// 5. Android – Register AppIconPackage in MainApplication.kt
// ─────────────────────────────────────────────
const withAppIconPackageRegistration = (config) => {
  return withMainApplication(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes('AppIconPackage()')) {
      // Already registered, skip
      return config;
    }

    config.modResults.contents = contents.replace(
      /PackageList\(this\)\.packages\.apply \{/,
      'PackageList(this).packages.apply {\n              add(AppIconPackage())'
    );

    return config;
  });
};

// ─────────────────────────────────────────────
// 6. iOS – Copy icon assets to ios/<name>/
// ─────────────────────────────────────────────
const withIosIconAssets = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosDir = path.join(projectRoot, 'ios', config.modRequest.projectName);
      const iconLightning = path.join(projectRoot, 'assets/icon-lightning.png');
      const iconCompass = path.join(projectRoot, 'assets/icon-compass.png');

      if (fs.existsSync(iosDir)) {
        fs.copyFileSync(iconLightning, path.join(iosDir, 'AppIcon-lightning.png'));
        fs.copyFileSync(iconCompass, path.join(iosDir, 'AppIcon-compass.png'));
      }
      return config;
    },
  ]);
};

// ─────────────────────────────────────────────
// 7. iOS – Copy AppIconModule.swift + .m to ios/<name>/
// ─────────────────────────────────────────────
const withIosNativeModule = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName;
      const iosDir = path.join(projectRoot, 'ios', projectName);
      const srcDir = path.join(projectRoot, 'plugins/native/ios');

      ['AppIconModule.swift', 'AppIconModule.m'].forEach((file) => {
        const src = path.join(srcDir, file);
        const dest = path.join(iosDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });

      return config;
    },
  ]);
};

// ─────────────────────────────────────────────
// 8. iOS – Add Swift + ObjC bridge to Xcode project
// ─────────────────────────────────────────────
const withIosNativeModuleXcodeProject = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName;

    // Ensure PBXVariantGroup exists to avoid node-xcode bug
    if (!xcodeProject.hash.project.objects.PBXVariantGroup) {
      xcodeProject.hash.project.objects.PBXVariantGroup = {};
    }

    // Get existing file references to avoid duplicates
    const fileRefs = xcodeProject.pbxFileReferenceSection() || {};
    const existingPaths = Object.values(fileRefs)
      .filter(Boolean)
      .map((ref) => (typeof ref === 'object' ? ref.path : null))
      .filter(Boolean);

    ['AppIconModule.swift', 'AppIconModule.m'].forEach((filename) => {
      const filePathInProject = `${projectName}/${filename}`;
      const alreadyAdded = existingPaths.some(
        (p) => p === filename || p === `"${filename}"` || p === filePathInProject || p === `"${filePathInProject}"`
      );

      if (!alreadyAdded) {
        // Add as a source file. we find the group key for the main project folder.
        const groupKey = xcodeProject.findPBXGroupKey({ name: projectName });
        // The path should be relative to the group's path if the group has one, 
        // but often in Expo it's easier to just use the filename if it's already in that directory.
        const target = xcodeProject.getFirstTarget().uuid;
        xcodeProject.addSourceFile(filename, { target }, groupKey);
      }
    });

    return config;
  });
};


// ─────────────────────────────────────────────
// 9. Android – local.properties: Restore SDK Path
// ─────────────────────────────────────────────
const withAndroidLocalProperties = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const path = require('path');
      const fs = require('fs');
      const localPropertiesPath = path.join(projectRoot, 'android', 'local.properties');

      // The user's SDK path as observed from previous successful builds
      const sdkDir = '/Users/pipigendut/Library/Android/sdk';

      if (!fs.existsSync(localPropertiesPath)) {
        fs.writeFileSync(localPropertiesPath, `sdk.dir=${sdkDir}\n`);
      }
      return config;
    },
  ]);
};

// ─────────────────────────────────────────────
// Compose all mods
// ─────────────────────────────────────────────
module.exports = (config) => {
  // Icon config (plist + manifest)
  config = withIosDynamicIcon(config);
  config = withAndroidDynamicIcon(config);

  // Asset copying
  config = withIconAssets(config);
  config = withIosIconAssets(config);

  // Native module injection (Android)
  config = withAndroidNativeModule(config);
  config = withAppIconPackageRegistration(config);
  config = withAndroidLocalProperties(config);

  // Native module injection (iOS)
  config = withIosNativeModule(config);
  config = withIosNativeModuleXcodeProject(config);

  return config;
};
