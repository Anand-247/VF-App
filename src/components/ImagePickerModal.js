import { View, StyleSheet } from "react-native"
import { Modal, Portal, Button, Text, Card } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { theme, spacing, shadows } from "../theme/theme"

export default function ImagePickerModal({ visible, onDismiss, onPickImage }) {
  const handlePickImage = (source) => {
    onPickImage(source)
    onDismiss()
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card style={styles.card}>
          <Card.Title
            title="Select Image Source"
            titleStyle={styles.title}
            left={(props) => <MaterialCommunityIcons {...props} name="image" size={24} color={theme.colors.primary} />}
          />
          <Card.Content>
            <Text style={styles.description}>Choose how you'd like to add an image</Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => handlePickImage("camera")}
                style={[styles.button, styles.cameraButton]}
                contentStyle={styles.buttonContent}
                icon="camera"
              >
                Take Photo
              </Button>

              <Button
                mode="contained"
                onPress={() => handlePickImage("library")}
                style={[styles.button, styles.libraryButton]}
                contentStyle={styles.buttonContent}
                icon="image-multiple"
              >
                Choose from Gallery
              </Button>
            </View>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Cancel
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    borderRadius: theme.roundness,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  cameraButton: {
    backgroundColor: theme.colors.primary,
  },
  libraryButton: {
    backgroundColor: theme.colors.secondary,
  },
  actions: {
    justifyContent: "center",
  },
  cancelButton: {
    minWidth: 100,
  },
})
