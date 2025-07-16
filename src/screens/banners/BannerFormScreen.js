import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Text, TextInput, Button, Card, Switch } from "react-native-paper"
import { Image } from "react-native"
import { bannersAPI } from "../../services/api"
import { pickImage } from "../../services/imageService"
import ImagePickerModal from "../../components/ImagePickerModal"
import { useLoading } from "../../context/LoadingContext"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

export default function BannerFormScreen({ navigation, route }) {
  const { banner } = route.params || {}
  const isEditing = !!banner

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null, // Changed to null initially
    link: "",
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [imagePickerVisible, setImagePickerVisible] = useState(false)

  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        image: banner.image ? { url: banner.image } : null, // Handle existing image properly
        link: banner.link || "",
        isActive: banner.isActive !== undefined ? banner.isActive : true,
      })
    }
  }, [banner])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Banner title is required"
    }

    if (!formData.image) {
      newErrors.image = "Banner image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImagePick = async (source) => {
    try {
      console.log("📸 Picking image from source:", source)
      const image = await pickImage(source)
      console.log("📸 Image picked:", image)
      
      if (image) {
        // Skip cropping for banners - use image directly
        console.log("✅ Using image directly (no crop):", image.uri)
        
        setFormData((prev) => ({
          ...prev,
          image: { uri: image.uri }
        }))
        
        // Clear any previous image errors
        setErrors((prev) => ({
          ...prev,
          image: null
        }))
        
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Image added successfully",
        })
        
        setImagePickerVisible(false)
      } else {
        console.warn("⚠️ No image returned from pickImage")
      }
    } catch (error) {
      console.error("❌ Error picking image:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
      })
    }
  }

  const handleImageCrop = async (croppedImage) => {
    console.log("🔍 Cropped image received:", croppedImage)
    
    try {
      if (!croppedImage?.uri) {
        console.error("❌ No URI in cropped image")
        // If cropping failed, fall back to original image
        if (selectedImage?.uri) {
          console.log("⚠️ Using original image as fallback")
          setFormData((prev) => ({
            ...prev,
            image: { uri: selectedImage.uri }
          }))
        }
        return
      }

      console.log("✅ Setting cropped image URI:", croppedImage.uri)
      
      // Store the cropped image similar to product form
      setFormData((prev) => ({
        ...prev,
        image: { uri: croppedImage.uri }
      }))

      // Clear any previous image errors
      setErrors((prev) => ({
        ...prev,
        image: null
      }))
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Image processed successfully",
      })
      
    } catch (error) {
      console.error("❌ Error in handleImageCrop:", error)
      
      // Fall back to original image if cropping fails
      if (selectedImage?.uri) {
        console.log("⚠️ Cropping failed, using original image")
        setFormData((prev) => ({
          ...prev,
          image: { uri: selectedImage.uri }
        }))
        
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "Using original image (crop failed)",
        })
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to process image",
        })
      }
    } finally {
      setSelectedImage(null)
      setImageCropVisible(false)
    }
  }

  // Helper function to get file extension from URI
  const getFileExtension = (uri) => {
    const parts = uri.split('.')
    return parts[parts.length - 1].toLowerCase()
  }

  // Helper function to get MIME type from extension
  const getMimeType = (extension) => {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    }
    return mimeTypes[extension] || 'image/jpeg'
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating banner..." : "Creating banner...")

      const form = new FormData()

      // Add text fields
      form.append("title", formData.title)
      form.append("description", formData.description || "")
      form.append("link", formData.link || "")
      form.append("isActive", formData.isActive.toString())

      // Handle image - only append if it's a new image with file URI
      if (formData.image?.uri && formData.image.uri.startsWith("file://")) {
        const ext = getFileExtension(formData.image.uri)
        const type = getMimeType(ext)

        const file = {
          uri: formData.image.uri,
          type,
          name: `banner_image.${ext}`,
        }

        console.log("✅ Adding banner image:", file)
        form.append("image", file)
      } else {
        console.log("ℹ️ No new image to upload (using existing image)")
      }

      // Debug: Log FormData contents
      console.log("FormData being sent:", {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        isActive: formData.isActive,
        hasNewImage: !!(formData.image?.uri && formData.image.uri.startsWith("file://"))
      })

      for (let [key, value] of form.entries()) {
        if (key === "image") {
          console.log("Image Entry:", value?.uri, value?.type, value?.name)
        } else {
          console.log(`${key}:`, value)
        }
      }

      let response
      if (isEditing) {
        response = await bannersAPI.update(banner._id, form)
      } else {
        response = await bannersAPI.create(form)
      }

      if (response && (response.data || response)) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Banner ${isEditing ? "updated" : "created"} successfully`,
        })
        navigation.goBack()
      }
    } catch (err) {
      console.error("Submit error:", err)
      console.error("Error response:", err.response?.data)
      
      // Show more specific error message
      let errorMessage = "Failed to save banner"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(", ")
      } else if (err.message) {
        errorMessage = err.message
      }
      
      Toast.show({ 
        type: "error", 
        text1: "Error", 
        text2: errorMessage 
      })
    } finally {
      hideLoading()
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{isEditing ? "Edit Banner" : "Add New Banner"}</Text>

            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Banner Image *</Text>
              {formData.image ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: formData.image.uri || formData.image.url }} 
                    style={styles.image} 
                    resizeMode="cover"
                  />
                  <Button mode="outlined" onPress={() => setImagePickerVisible(true)} style={styles.changeImageButton}>
                    Change Image
                  </Button>
                </View>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => setImagePickerVisible(true)}
                  icon="camera"
                  style={styles.addImageButton}
                >
                  Add Image
                </Button>
              )}
              {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
            </View>

            {/* Form Fields */}
            <TextInput
              label="Banner Title *"
              value={formData.title}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Link URL (Optional)"
              value={formData.link}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, link: text }))}
              mode="outlined"
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Active Status */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active Status</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value }))}
                color={theme.colors.primary}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {isEditing ? "Update Banner" : "Create Banner"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <ImagePickerModal
        visible={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
        onPickImage={handleImagePick}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
  },
  cardContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 150,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
  },
  changeImageButton: {
    borderColor: theme.colors.primary,
  },
  addImageButton: {
    backgroundColor: theme.colors.primary,
  },
  input: {
    marginBottom: spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
})