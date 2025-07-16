import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Text, TextInput, Button, Card, Chip } from "react-native-paper"
import { Image } from "react-native"
import { categoriesAPI } from "../../services/api"
import { pickImage, uploadImage } from "../../services/imageService"
import ImagePickerModal from "../../components/ImagePickerModal"
import ImageCropModal from "../../components/ImageCropModal"
import { useLoading } from "../../context/LoadingContext"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

export default function CategoryFormScreen({ navigation, route }) {
  const { category } = route.params || {}
  const isEditing = !!category

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState({})
  const [imagePickerVisible, setImagePickerVisible] = useState(false)
  const [imageCropVisible, setImageCropVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        tags: category.tags || [],
      })
    }
  }, [category])

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
      const image = await pickImage(source)
      if (image) {
        setSelectedImage(image)
        setImageCropVisible(true)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
      })
    }
  }

  const handleImageCrop = async (croppedImage) => {
    try {
      showLoading("Uploading image...")
      const uploadResponse = await uploadImage(croppedImage.uri, "categories")

      if (uploadResponse.success) {
        setFormData((prev) => ({
          ...prev,
          image: uploadResponse.imageUrl,
        }))
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Image uploaded successfully",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to upload image",
      })
    } finally {
      hideLoading()
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating category..." : "Creating category...")

      let response
      if (isEditing) {
        response = await categoriesAPI.update(category._id, formData)
      } else {
        response = await categoriesAPI.create(formData)
      }

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Category ${isEditing ? "updated" : "created"} successfully`,
        })
        navigation.goBack()
      }
    } catch (error) {
      console.error("Error saving category:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to ${isEditing ? "update" : "create"} category`,
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
            <Text style={styles.title}>{isEditing ? "Edit Category" : "Add New Category"}</Text>

            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Category Image</Text>
              {formData.image.url ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: formData.image.url }} style={styles.image} />
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
            </View>

            {/* Form Fields */}
            <TextInput
              label="Category Name *"
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              error={!!errors.description}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

            {/* Tags Section */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  label="Add Tag"
                  value={tagInput}
                  onChangeText={setTagInput}
                  mode="outlined"
                  style={styles.tagInput}
                  onSubmitEditing={addTag}
                />
                <Button mode="contained" onPress={addTag} style={styles.addTagButton} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </View>

              {formData.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <Chip key={index} onClose={() => removeTag(tag)} style={styles.tag}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <ImagePickerModal
        visible={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
        onPickImage={handleImagePick}
      />

      <ImageCropModal
        visible={imageCropVisible}
        onDismiss={() => setImageCropVisible(false)}
        imageUri={selectedImage?.uri}
        onCropComplete={handleImageCrop}
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
    width: 200,
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
  tagsSection: {
    marginBottom: spacing.lg,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    backgroundColor: theme.colors.secondary,
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primaryContainer,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
})
