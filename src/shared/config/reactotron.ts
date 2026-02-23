import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';

if (__DEV__) {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const scriptHost = scriptURL ? scriptURL.split('://')[1].split(':')[0] : 'localhost';

  Reactotron
    .configure({
      name: 'Dating App Mobile',
      host: scriptHost, // Auto-detect host (works for physical devices)
    })
    .useReactNative({
      asyncStorage: false, // or true if you use it
      networking: {
        ignoreUrls: /symbolicate/,
      },
      editor: false,
      errors: { veto: (stackFrame) => false },
      overlay: false,
    })
    .connect();

  // Clear log on start
  Reactotron.clear?.();

  // Extend console with Reactotron
  const oldConsoleLog = console.log;
  console.log = (...args: any[]) => {
    oldConsoleLog(...args);
    Reactotron.display({
      name: 'CONSOLE.LOG',
      value: args,
      preview: args.length > 0 && typeof args[0] === 'string' ? args[0] : 'Log',
    });
  };
}

export default Reactotron;
