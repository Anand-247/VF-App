  import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, PermissionsAndroid } from "react-native"
import { Text, TextInput, Button, Card, Chip } from "react-native-paper"
import { Image } from "react-native"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import { categoriesAPI } from "../../services/api"
import { useLoading } from "../../context/LoadingContext"
import ImagePickerModal from "../../components/ImagePickerModal"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"
import ImageCropPicker from "react-native-image-crop-picker"

export default function CategoryFormScreen({ navigation, route }) {
  const { category } = route.params || {}
  const isEditing = !!category
  const [imagePickerVisible, setImagePickerVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState({})
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (category) {
      console.log("🚀 ~ CategoryFormScreen ~ category:", category.image)
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image ? { uri: category.image.url } : null,
        tags: category.tags || [],
      })
    }
  }, [category])

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
        console.log("🚀 ~ requestCameraPermission ~ granted:", granted)
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
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImagePick = async (source) => {
  let image = null;
  try {
    console.log("🚀 ~ handleImagePick ~ source:", source);

    // Picking from gallery (you can enable camera later if needed)
    image = await ImageCropPicker.openPicker({
      width: 600,
      height: 700,
      cropping: true,
      includeBase64: false,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      multiple: false, // single image only
    });

    console.log("🚀 ~ handleImagePick ~ image:", image);

    const processedImage = {
      uri: image.path,
      type: image.mime || 'image/jpeg',
      name: image.filename || `product_image_${Date.now()}.jpg`,
    };

    setFormData(prev => ({
      ...prev,
      image: processedImage // overwrite with a single image
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


  // Process and compress image
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

      setFormData(prev => ({
        ...prev,
        image: { 
          uri: resizedImage.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || `category_image_${Date.now()}.jpg`
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

  // Edit existing image
  const editExistingImage = async () => {
    if (!formData.image?.uri) return

    try {
      const hasPermission = await requestStoragePermission()
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to access photos')
        return
      }

      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      }

      launchImageLibrary(options, (response) => {
        if (response.didCancel || response.error) {
          return
        }

        if (response.assets && response.assets[0]) {
          processImage(response.assets[0])
        }
      })
    } catch (error) {
      console.error('Edit image error:', error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to edit image",
      })
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating category..." : "Creating category...")
      setLoading(true)
      const form = new FormData()
      
      form.append("name", formData.name)
      form.append("description", formData.description)
      form.append("tags", JSON.stringify(formData.tags))

      // Handle image
      if (formData.image?.uri) {
        const imageFile = {
          uri: formData.image.uri,
          type: formData.image.type || 'image/jpeg',
          name: formData.image.name || `category_image_${Date.now()}.jpg`,
        }
        form.append("image", imageFile)
      }

      let response
      if (isEditing) {
        response = await categoriesAPI.update(category._id, form)
      } else {
        response = await categoriesAPI.create(form)
      }

      setLoading(false)

      if (response) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Category ${isEditing ? "updated" : "created"} successfully`,
        })
        navigation.goBack()
      }
    } catch (error) {
      setLoading(false)
      console.error("Error saving category:", error)
      const msg = error.response?.data?.message ||
                   error.response?.data?.errors?.map(e => e.msg).join(", ") ||
                   error.message ||
                   `Failed to ${isEditing ? "update" : "create"} category`
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
      })
    } finally {
      hideLoading()
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>
              {isEditing ? "Edit Category" : "Add New Category"}
            </Text>

            {/* Enhanced Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Category Image</Text>
              {formData.image?.uri ? (
                <View style={styles.imageContainer}>
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: formData.image.uri }} 
                      style={styles.image} 
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Button
                        mode="contained"
                        onPress={editExistingImage}
                        icon="pencil"
                        style={styles.editButton}
                        compact
                      >
                        Edit
                      </Button>
                    </View>
                  </View>
                  <View style={styles.imageButtons}>
                    <Button 
                      mode="outlined" 
                      // onPress={() => setImagePickerVisible(true)} 
                      onPress={() => handleImagePick()}
                      style={styles.changeImageButton}
                      icon="camera"
                    >
                      Change
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={removeImage} 
                      style={styles.removeImageButton}
                      icon="delete"
                    >
                      Remove
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Button
                    mode="contained"
                    // onPress={() => setImagePickerVisible(true)}
                    onPress={() => handleImagePick()}
                    icon="camera-plus"
                    style={styles.addImageButton}
                    contentStyle={styles.addImageButtonContent}
                  >
                    Add Category Image
                  </Button>
                  <Text style={styles.imageHint}>
                    Recommended: 800x600px • JPEG, PNG supported
                  </Text>
                </View>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <TextInput
                label="Category Name *"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="tag" />}
                maxLength={50}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TextInput
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                error={!!errors.description}
                left={<TextInput.Icon icon="text" />}
                maxLength={500}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Enhanced Tags Section */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags (Optional)</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  label="Add Tag"
                  value={tagInput}
                  onChangeText={setTagInput}
                  mode="outlined"
                  style={styles.tagInput}
                  onSubmitEditing={addTag}
                  left={<TextInput.Icon icon="tag-plus" />}
                  right={
                    <TextInput.Icon 
                      icon="plus" 
                      onPress={addTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 10}
                    />
                  }
                  maxLength={20}
                />
              </View>
              
              {formData.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsLabel}>
                    {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} added:
                  </Text>
                  <View style={styles.tagsWrapper}>
                    {formData.tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        onClose={() => removeTag(tag)} 
                        style={styles.tag}
                        mode="outlined"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              
              {formData.tags.length >= 10 && (
                <Text style={styles.tagLimitText}>
                  Maximum 10 tags allowed
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              icon={isEditing ? "content-save" : "plus"}
            >
              {loading ? "Loading..." : isEditing ? "Update Category" : "Create Category"}
            </Button>
          </Card.Content>
        </Card>
        <ImagePickerModal 
          visible={imagePickerVisible} 
          onDismiss={() => setImagePickerVisible(false)} 
          onPickImage={handleImagePick} 
        />
      </ScrollView>
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
    borderRadius: theme.roundness * 2,
  },
  cardContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  
  // Enhanced Image Section
  imageSection: {
    marginBottom: spacing.xl,
  },
  imageContainer: {
    alignItems: "center",
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: theme.roundness * 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  image: {
    width: 280,
    height: 200,
    backgroundColor: theme.colors.surfaceVariant,
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.secondary,
    minWidth: 60,
  },
  imageButtons: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: 'center',
  },
  changeImageButton: {
    borderColor: theme.colors.primary,
    minWidth: 100,
  },
  removeImageButton: {
    borderColor: theme.colors.error,
    minWidth: 100,
  },
  noImageContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.roundness * 2,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  addImageButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  addImageButtonContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  imageHint: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  
  // Form Section
  formSection: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
  },
  
  // Enhanced Tags Section
  tagsSection: {
    marginBottom: spacing.xl,
  },
  tagInputContainer: {
    marginBottom: spacing.md,
  },
  tagInput: {
    backgroundColor: theme.colors.surface,
  },
  tagsContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: theme.roundness,
    marginBottom: spacing.sm,
  },
  tagsLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary,
  },
  tagLimitText: {
    fontSize: 12,
    color: theme.colors.error,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Submit Button
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: spacing.md,
    borderRadius: theme.roundness * 2,
  },
  submitButtonContent: {
    paddingVertical: spacing.md,
  },
})