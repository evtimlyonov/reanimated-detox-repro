import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { authenticateAsync } from 'expo-local-authentication';

export default function App() {
  const [showAnimated, setShowAnimated] = useState(true);
  const [result, setResult] = useState('none');

  const authenticate = async () => {
    const response = await authenticateAsync({ disableDeviceFallback: true });
    setResult(response.success ? 'success' : response.error);
  };

  return (
    <View style={styles.container}>
      <Text testID="title">Reanimated + Detox repro</Text>

      {/* A single mounted Animated component is enough to start
          PropsRegistryGarbageCollector's 500 ms setInterval */}
      {showAnimated && <Animated.View testID="animated" style={styles.box} />}

      <Text testID="animated-state">Animated.View mounted: {String(showAnimated)}</Text>
      <Button
        testID="unmount-animated"
        title="Unmount Animated.View"
        onPress={() => setShowAnimated(false)}
      />
      <Button testID="auth" title="Authenticate with Face ID" onPress={authenticate} />
      <Text testID="result">Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: '#5b4ff5',
  },
});
