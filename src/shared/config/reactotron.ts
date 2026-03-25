import Reactotron from 'reactotron-react-native';
import reactotronZustand from 'reactotron-plugin-zustand';
import { NativeModules } from 'react-native';

import { useUserStore } from '../../store/useUserStore';
import { useChatStore } from '../../store/useChatStore';
import { useMasterStore } from '../../store/useMasterStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useToastStore } from '../../store/useToastStore';

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
    .use(
      reactotronZustand({
        stores: [
          { name: 'userStore', store: useUserStore },
          { name: 'chatStore', store: useChatStore },
          { name: 'masterStore', store: useMasterStore },
          { name: 'themeStore', store: useThemeStore },
          { name: 'toastStore', store: useToastStore },
        ],
      })
    )
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
