import { StyleSheet, Text, View } from 'react-native';

// Minimal default export required by Expo Router.
// Replace with the actual UI after confirming the app renders.
export default function MyCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Card (stub)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  text: { fontSize: 18, color: '#000' },
});