import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { Text, TextInput, Button, Card, Chip } from "react-native-paper"
import { Image } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { categoriesAPI } from "../../services/api"
import { useLoading } from "../../context/LoadingContext"
import ImagePickerModal from "../../components/ImagePickerModal"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

export default function CategoryFormScreen({ navigation, route }) {
  const { category } = route.params || {}
  const isEditing = !!category
  const [imagePickerVisible, setImagePickerVisible] = useState(false)

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
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image ? { uri: category.image.url } : null,
        tags: category.tags || [],
      })
    }
  }, [category])

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!')
      }
    })()
  }, [])

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
    try {
      let result;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0])
      }
    } catch (err) {
      console.error("Image pick error", err)
      Toast.show({ type: "error", text1: "Image Error", text2: "Failed to pick image" })
    }
  }

  // Process and compress image
  const processImage = async (imageAsset) => {
    try {
      showLoading("Processing image...")
      
      // Resize and compress image
      const manipulatedImage = await manipulateAsync(
        imageAsset.uri,
        [
          { resize: { width: 800 } }, // Resize to max width of 800px
        ],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
        }
      )

      setFormData(prev => ({
        ...prev,
        image: { uri: manipulatedImage.uri }
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0])
      }
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

  const getFileExtension = (uri) => {
    const parts = uri.split('.')
    return parts[parts.length - 1].toLowerCase()
  }

  const getMimeType = (ext) => ({
    jpg: "image/jpeg",
    jpeg: "image/jpeg", 
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp"
  })[ext] || "image/jpeg"

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating category..." : "Creating category...")
      const form = new FormData()
      
      form.append("name", formData.name)
      form.append("description", formData.description)
      form.append("tags", JSON.stringify(formData.tags))

      // Handle image
      if (formData.image?.uri) {
        const ext = getFileExtension(formData.image.uri)
        const file = {
          uri: formData.image.uri,
          type: getMimeType(ext),
          name: `category_image_${Date.now()}.${ext}`,
        }
        form.append("image", file)
      }

      let response
      if (isEditing) {
        response = await categoriesAPI.update(category._id, form)
      } else {
        response = await categoriesAPI.create(form)
      }

      if (response) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Category ${isEditing ? "updated" : "created"} successfully`,
        })
        navigation.goBack()
      }
    } catch (error) {
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
                      // onPress={showImagePicker} 
                      onPress={() => setImagePickerVisible(true)} 
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
                    // onPress={showImagePicker}
                    onPress={()=>setImagePickerVisible(true)}
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
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              icon={isEditing ? "content-save" : "plus"}
            >
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </Card.Content>
        </Card>
        <ImagePickerModal visible={imagePickerVisible} onDismiss={() => setImagePickerVisible(false)} onPickImage={handleImagePick} />
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