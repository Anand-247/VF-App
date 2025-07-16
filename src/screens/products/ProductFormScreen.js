import { useState, useEffect } from "react"
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
} from "react-native"
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Menu,
  IconButton,
} from "react-native-paper"
import Toast from "react-native-toast-message"

import { productsAPI, categoriesAPI } from "../../services/api"
import { pickImage } from "../../services/imageService"
import ImagePickerModal from "../../components/ImagePickerModal"
import ImageCropModal from "../../components/ImageCropModal"
import { useLoading } from "../../context/LoadingContext"
import { shadows, spacing, theme } from "../../theme/theme"

export default function ProductFormScreen({ navigation, route }) {
  const { product } = route.params || {}
  const isEditing = !!product

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: "",
    specifications: [],
  })

  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [imagePickerVisible, setImagePickerVisible] = useState(false)
  const [imageCropVisible, setImageCropVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [specInput, setSpecInput] = useState({ key: "", value: "" })
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    loadCategories()
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category?._id || "",
        images: product.images || [],
        stock: product.stock?.toString() || "",
        specifications: product.specifications || [],
      })
    }
  }, [product])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response) {
        setCategories(response)
      }
    } catch (err) {
      console.error("Failed to load categories", err)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0)
      newErrors.price = "Enter a valid price"
    if (!formData.category) newErrors.category = "Category is required"
    if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0))
      newErrors.stock = "Stock must be a non-negative number"

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
    } catch (err) {
      console.error("Image pick error", err)
      Toast.show({ type: "error", text1: "Image Error", text2: "Failed to pick image" })
    }
  }

  const handleImageCrop = async (croppedImage) => {
    if (!croppedImage?.uri) return

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { uri: croppedImage.uri }],
    }))

    setSelectedImage(null)
    setImageCropVisible(false)
  }

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat._id === id)
    return category?.name || "Select Category"
  }

  const addSpecification = () => {
    if (specInput.key && specInput.value) {
      setFormData((prev) => ({
        ...prev,
        specifications: [...prev.specifications, specInput],
      }))
      setSpecInput({ key: "", value: "" })
    }
  }

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const getFileExtension = (uri) => uri.split(".").pop().toLowerCase()
  const getMimeType = (ext) => ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", bmp: "image/bmp", webp: "image/webp" })[ext] || "image/jpeg"

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating..." : "Creating...")
      const form = new FormData()

      form.append("name", formData.name)
      form.append("description", formData.description)
      form.append("price", formData.price)
      form.append("category", formData.category)
      form.append("stockQuantity", formData.stock || "0")
      form.append("specifications", JSON.stringify(formData.specifications || []))

      formData.images.forEach((img, index) => {
        if (img?.uri?.startsWith("file://")) {
          const ext = getFileExtension(img.uri)
          const file = {
            uri: img.uri,
            type: getMimeType(ext),
            name: `image_${index}.${ext}`,
          }
          form.append("images", file)
        }
      })

      const response = isEditing ? await productsAPI.update(product._id, form) : await productsAPI.create(form)

      if (response) {
        Toast.show({ type: "success", text1: "Success", text2: `Product ${isEditing ? "updated" : "created"} successfully` })
        navigation.goBack()
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.map(e => e.msg).join(", ") || err.message || "Failed to save product"
      Toast.show({ type: "error", text1: "Error", text2: msg })
    } finally {
      hideLoading()
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{isEditing ? "Edit Product" : "Add Product"}</Text>

            <Text style={styles.sectionTitle}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {formData.images.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Pressable onPress={() => setFullscreenImage(img.uri || img.url)}>
                    <Image source={{ uri: img.uri || img.url }} style={styles.image} resizeMode="cover" />
                  </Pressable>
                  <Button mode="outlined" compact onPress={() => removeImage(index)} style={styles.removeImageButton} labelStyle={{ fontSize: 10 }}>
                    Remove
                  </Button>
                </View>
              ))}
            </ScrollView>
            <Button mode="contained" onPress={() => setImagePickerVisible(true)} icon="camera" style={styles.addImageButton}>
              Add Image
            </Button>

            <TextInput label="Name *" value={formData.name} onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))} style={styles.input} mode="outlined" error={!!errors.name} />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput label="Description *" value={formData.description} onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))} style={styles.input} mode="outlined" multiline numberOfLines={4} error={!!errors.description} />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

            <TextInput label="Price *" value={formData.price} onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))} style={styles.input} mode="outlined" keyboardType="numeric" error={!!errors.price} />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

            <TextInput label="Stock Quantity" value={formData.stock} onChangeText={(text) => setFormData((prev) => ({ ...prev, stock: text }))} style={styles.input} mode="outlined" keyboardType="numeric" error={!!errors.stock} />
            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}

            <Text style={styles.sectionTitle}>Category *</Text>
            <Menu visible={categoryMenuVisible} onDismiss={() => setCategoryMenuVisible(false)} anchor={
              <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={[styles.categoryButton, errors.category && styles.errorBorder]} contentStyle={{ justifyContent: 'flex-start' }}>
                {getCategoryName(formData.category)}
              </Button>
            }>
              {categories.map((cat) => (
                <Menu.Item key={cat._id} title={cat.name} onPress={() => {
                  setFormData((prev) => ({ ...prev, category: cat._id }))
                  setCategoryMenuVisible(false)
                }} />
              ))}
            </Menu>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specInputContainer}>
              <TextInput label="Key" value={specInput.key} onChangeText={(text) => setSpecInput((prev) => ({ ...prev, key: text }))} style={[styles.input, styles.halfWidth]} mode="outlined" />
              <TextInput label="Value" value={specInput.value} onChangeText={(text) => setSpecInput((prev) => ({ ...prev, value: text }))} style={[styles.input, styles.halfWidth]} mode="outlined" />
            </View>
            <Button mode="outlined" onPress={addSpecification} disabled={!specInput.key || !specInput.value} style={styles.addSpecButton}>
              Add Specification
            </Button>

            <View style={styles.specificationsContainer}>
              {formData.specifications.map((spec, index) => (
                <Chip key={index} onClose={() => removeSpecification(index)} style={styles.specificationChip}>
                  {spec.key}: {spec.value}
                </Chip>
              ))}
            </View>

            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} contentStyle={styles.submitButtonContent}>
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </Card.Content>
        </Card>

        <Modal visible={!!fullscreenImage} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setFullscreenImage(null)}>
            <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} resizeMode="contain" />
          </Pressable>
        </Modal>

        <ImagePickerModal visible={imagePickerVisible} onDismiss={() => setImagePickerVisible(false)} onPickImage={handleImagePick} />
        <ImageCropModal visible={imageCropVisible} onDismiss={() => setImageCropVisible(false)} imageUri={selectedImage?.uri} onCropComplete={handleImageCrop} />
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
    marginTop: spacing.md,
  },
  imagesContainer: {
    marginBottom: spacing.md,
  },
  imageWrapper: {
    marginRight: spacing.md,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: theme.roundness,
    marginBottom: spacing.xs,
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButton: {
    borderColor: theme.colors.error,
  },
  addImageButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  specInputContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  categoryButton: {
    borderColor: theme.colors.outline,
    justifyContent: "flex-start",
    marginBottom: spacing.sm,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  addSpecButton: {
    backgroundColor: theme.colors.secondary,
    marginBottom: spacing.md,
  },
  specificationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  specificationChip: {
    backgroundColor: theme.colors.primaryContainer,
    marginBottom: spacing.xs,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
})
