import { useState } from "react"
import { View, StyleSheet, ScrollView, Dimensions } from "react-native"
import { Modal, Portal, Button, Text, Card, RadioButton, Divider } from "react-native-paper"
import { Image } from "react-native"
import { theme, spacing, shadows } from "../theme/theme"
import { cropSizes, cropImage } from "../services/imageService"

const { width: screenWidth } = Dimensions.get("window")

export default function ImageCropModal({ visible, onDismiss, imageUri, onCropComplete }) {
  const [selectedSize, setSelectedSize] = useState("square")
  const [cropping, setCropping] = useState(false)

  const handleCrop = async () => {
    try {
      setCropping(true)
      const croppedImage = await cropImage(imageUri, cropSizes[selectedSize])
      onCropComplete(croppedImage)
      onDismiss()
    } catch (error) {
      console.error("Crop error:", error)
    } finally {
      setCropping(false)
    }
  }

  const previewSize = screenWidth * 0.6

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card style={styles.card}>
          <Card.Title title="Crop Image" titleStyle={styles.title} />
          <Card.Content>
            <View style={styles.previewContainer}>
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.preview,
                    {
                      width: previewSize,
                      height: previewSize * (cropSizes[selectedSize].height / cropSizes[selectedSize].width),
                    },
                  ]}
                  resizeMode="cover"
                />
              )}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Select Crop Size:</Text>

            <ScrollView style={styles.optionsContainer}>
              {Object.entries(cropSizes).map(([key, size]) => (
                <View key={key} style={styles.option}>
                  <RadioButton
                    value={key}
                    status={selectedSize === key ? "checked" : "unchecked"}
                    onPress={() => setSelectedSize(key)}
                    color={theme.colors.primary}
                  />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{size.label}</Text>
                    <Text style={styles.optionDimensions}>
                      {size.width} × {size.height}px
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button mode="outlined" onPress={onDismiss} disabled={cropping} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCrop} loading={cropping} disabled={cropping} style={styles.button}>
              {cropping ? "Cropping..." : "Crop Image"}
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
    maxHeight: "90%",
  },
  card: {
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  preview: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surfaceVariant,
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    maxHeight: 200,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  optionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: "500",
  },
  optionDimensions: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  button: {
    minWidth: 100,
  },
})
