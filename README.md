# Reanimated 4.5 + Detox: app never idle while the iOS Face ID sheet is open

Minimal repro for a Detox hang caused by Reanimated's `PropsRegistryGarbageCollector`
500 ms `setInterval` (enabled by `FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS`, `true` by default in 4.5.x).

| Package | Version |
| --- | --- |
| expo | 57.0.31 |
| react-native | 0.86.3 (New Architecture) |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| expo-local-authentication | 57.0.3 |
| detox | 20.51.3 |

## The app

- One `Animated.View` (mounted by default)
- A button to unmount it
- A button that calls `authenticateAsync()` (shows the system Face ID sheet)

## Run

Requires Xcode and an `iPhone 17 Pro` simulator (change it in `.detoxrc.js`).
Keep only one simulator booted (Detox's `matchFace` uses `applesimutils --booted` on iOS 26+).

```sh
npm install
npx expo prebuild -p ios
npm run e2e:build
npm run e2e:test
```

## Expected vs actual

Both tests do the same thing: tap "Authenticate", make one synchronized Detox call
while the Face ID sheet is open, then `device.matchFace()`.

- **"PASSES when no Animated component is mounted"**: unmounts the `Animated.View` first,
  so the interval is cleared. The app becomes idle and the test passes.
- **"HANGS when one Animated.View is mounted"**: the test times out. Detox keeps reporting:

  ```
  The app is busy with the following tasks:
  • 1 enqueued native timers:
    - Timer #1: Time until fire: 0.500. Repeat interval: 0. Is recurring: NO.
  ```

## Why

1. With `FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS` on, `PropsRegistryGarbageCollector.registerInterval()`
   runs `setInterval(..., 500)` while any animated component is mounted.
2. The Face ID sheet makes the app inactive. `RCTTiming` treats `UIApplicationWillResignActiveNotification`
   as background and runs pending JS timers on `NSTimer` sleep timers.
3. Every 500 ms a new non-recurring 0.5 s `NSTimer` is created, so Detox never sees the app idle.
