/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * React Native Configuration
 *
 * This configuration excludes react-native-worklets from autolinking
 * because React Native Reanimated 3.17+ already includes worklets internally.
 *
 * NativeWind v4 needs the worklets Babel plugin, but we don't want the native module.
 */

module.exports = {
  dependencies: {
    'react-native-worklets': {
      platforms: {
        android: null, // Disable Android native module
        ios: null,     // Disable iOS native module
      },
    },
  },
};
