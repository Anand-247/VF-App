import { View, StyleSheet } from "react-native"
import { ActivityIndicator, Text } from "react-native-paper"
import { theme, spacing } from "../theme/theme"

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  text: {
    marginTop: spacing.md,
    color: theme.colors.onBackground,
  },
})
