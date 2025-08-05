import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, PermissionsAndroid } from "react-native"
import { Text, TextInput, Button, Card, Switch } from "react-native-paper"
import { Image } from "react-native"
import { bannersAPI } from "../../services/api"
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import ImagePickerModal from "../../components/ImagePickerModal"
import { useLoading } from "../../context/LoadingContext"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"
import ImageCropPicker from "react-native-image-crop-picker"

export default function BannerFormScreen({ navigation, route }) {
  const { banner } = route.params || {}
  const isEditing = !!banner
  const [loading, setLoading] = useState(false)

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
        image: banner.image ? { uri: banner.image.url } : null, // Handle existing image properly
        link: banner.link || "",
        isActive: banner.isActive !== undefined ? banner.isActive : true,
      })
    }
  }, [banner])

  // Request permissions for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to take photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs storage permission to access photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

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

  // const handleImagePick = async (source) => {
  //   try {
  //     let hasPermission = true

  //     if (source === 'camera') {
  //       hasPermission = await requestCameraPermission()
  //       if (!hasPermission) {
  //         Alert.alert('Permission Denied', 'Camera permission is required to take photos')
  //         return
  //       }
  //     } else {
  //       hasPermission = await requestStoragePermission()
  //       if (!hasPermission) {
  //         Alert.alert('Permission Denied', 'Storage permission is required to access photos')
  //         return
  //       }
  //     }

  //     const options = {
  //       mediaType: 'photo',
  //       includeBase64: false,
  //       maxHeight: 2000,
  //       maxWidth: 2000,
  //       quality: 0.8,
  //       allowEditing: true,
  //     }

  //     const callback = (response) => {
  //       if (response.didCancel || response.error) {
  //         console.log('Image picker cancelled or error:', response.error)
  //         return
  //       }

  //       if (response.assets && response.assets[0]) {
  //         processImage(response.assets[0])
  //       }
  //     }

  //     if (source === 'camera') {
  //       launchCamera(options, callback)
  //     } else {
  //       launchImageLibrary(options, callback)
  //     }
  //   } catch (err) {
  //     console.error("Image pick error", err)
  //     Toast.show({ type: "error", text1: "Image Error", text2: "Failed to pick image" })
  //   }
  // }
  const handleImagePick = async (source) => {
  let image = null;
  try {
    // console.log("🚀 ~ handleImagePick ~ source:", source);

    image = await ImageCropPicker.openPicker({
      width: 800,
      height: 300,
      cropping: true,
      includeBase64: false,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      multiple: false, // explicitly single image
    });

    const processedImage = {
      uri: image.path,
      type: image.mime || 'image/jpeg',
      name: image.filename || `product_image_${Date.now()}.jpg`
    };

    setFormData(prev => ({
      ...prev,
      image: processedImage // only keep the new single image
    }));

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Image selected successfully",
    });
  } catch (error) {
    if (error?.message?.toLowerCase().includes('cancel')) return;
    console.error('Image picker error:', error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to pick image",
    });
  } finally {
    hideLoading();
  }
};

  const processImage = async (imageAsset) => {
    try {
      showLoading("Processing image...")
      
      // Resize and compress image using react-native-image-resizer
      const resizedImage = await ImageResizer.createResizedImage(
        imageAsset.uri,
        800, // max width
        600, // max height
        'JPEG',
        80, // quality (0-100)
        0, // rotation
        undefined, // output path
        false, // keep metadata
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      )
      // console.log("🚀 ~ processImage ~ resizedImage:", resizedImage.uri)

      setFormData(prev => ({
        ...prev,
        image: { 
          uri: resizedImage.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || `banner_image_${Date.now()}.jpg`
        }
      }))

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Image processed successfully",
      })
    } catch (error) {
      console.error('Image processing error:', error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to process image",
      })
    } finally {
      hideLoading()
    }
  }

  const removeImage = () => {
    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              image: null,
            }))
          }
        }
      ]
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating banner..." : "Creating banner...")
      setLoading(true)

      const form = new FormData()

      // Add text fields
      form.append("title", formData.title)
      form.append("description", formData.description || "")
      form.append("link", formData.link || "")
      form.append("isActive", formData.isActive.toString())

      // Handle image
      if (formData.image?.uri) {
        const imageFile = {
          uri: formData.image.uri,
          type: formData.image.type || 'image/jpeg',
          name: formData.image.name || `banner_image_${Date.now()}.jpg`,
        }
        form.append("image", imageFile)
      }

      // Debug: Log FormData contents
      console.log("FormData being sent:", {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        isActive: formData.isActive,
        hasNewImage: !!(formData.image?.uri && formData.image.uri.startsWith("file://"))
      })

      let response
      if (isEditing) {
        response = await bannersAPI.update(banner._id, form)
      } else {
        response = await bannersAPI.create(form)
      }

      setLoading(false)

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
                    source={{ uri: formData.image.uri }} 
                    style={styles.image} 
                    resizeMode="cover"
                  />
                  {/* <Button mode="outlined" onPress={() => setImagePickerVisible(true)} style={styles.changeImageButton}> */}
                  <Button mode="outlined" onPress={() => handleImagePick()} style={styles.changeImageButton}>
                    Change Image
                  </Button>
                </View>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => handleImagePick()}
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
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {loading ? "Loading..." : isEditing ? "Update Banner" : "Create Banner"}
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