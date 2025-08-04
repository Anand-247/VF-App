// ProductFormScreen.js - Updated with Modal Navigation Support
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
  Alert,
  Dimensions,
  PermissionsAndroid,
} from "react-native"
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Menu,
  IconButton,
  Divider,
  RadioButton,
  Portal,
} from "react-native-paper"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import Toast from "react-native-toast-message"
import { productsAPI, categoriesAPI } from "../../services/api"
import { useLoading } from "../../context/LoadingContext"
import { shadows, spacing, theme } from "../../theme/theme"
import ImagePickerModal from "../../components/ImagePickerModal"
import ImageCropPicker from "react-native-image-crop-picker"

const { width: screenWidth } = Dimensions.get('window')

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
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [specInput, setSpecInput] = useState({ key: "", value: "" })
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)
  
  const [imagePickerVisible, setImagePickerVisible] = useState(false)
  const { showLoading, hideLoading } = useLoading()
  const [loading, setLoading] = useState(false)
  

  useEffect(() => {
    loadCategories()
    requestPermissions()
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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await requestCameraPermission()
      await requestStoragePermission()
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response) {
        setCategories(response)
      }
    } catch (err) {
      console.error("Failed to load categories", err)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load categories"
      })
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
    if (formData.images.length === 0) newErrors.images = "At least one image is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Process and compress image
  const handleImagePick = async (source) => {
    let image = null
    try {
      console.log("🚀 ~ handleImagePick ~ source:", source)
      // if (source === 'camera') {
      //   image = await ImageCropPicker.openCamera({
      //     width: 800,
      //     height: 600,
      //     cropping: true,
      //     includeBase64: false,
      //     compressImageQuality: 0.8,
      //     mediaType: 'photo',
      //   })
      //   console.log("🚀 ~ handleImagePick ~ image:", image)
      // } else {
      if (true) {
        image = await ImageCropPicker.openPicker({
          width: 600,
          height: 800,
          cropping: true,
          includeBase64: false,
          compressImageQuality: 0.8,
          mediaType: 'photo',
          // multiple: true,
          // maxFiles: 5 - formData.images.length, // limit total images to 5
        })
      }
      // Normalize to array
      const imagesArray = Array.isArray(image) ? image : [image];
      const processedImages = imagesArray.map((img, idx) => ({
        uri: img.path,
        type: img.mime || 'image/jpeg',
        name: img.filename || `product_image_${Date.now()}_${idx}.jpg`
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processedImages].slice(0, 5)
      }));

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Images processed successfully",
      });
    } catch (error) {
      if (error?.message?.toLowerCase().includes('cancel')) return;
      console.error('Image picker error:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick images",
      });
    } finally {
      hideLoading();
    }
  }

  const removeImage = (index) => {
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
              images: prev.images.filter((_, i) => i !== index),
            }))
          }
        }
      ]
    )
  }

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat._id === id)
    return category?.name || "Select Category"
  }

  const addSpecification = () => {
    if (specInput.key.trim() && specInput.value.trim()) {
      // Check for duplicate keys
      const existingSpec = formData.specifications.find(spec => 
        spec.key.toLowerCase() === specInput.key.toLowerCase()
      )
      
      if (existingSpec) {
        Alert.alert("Duplicate Key", "This specification key already exists")
        return
      }

      setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, { 
          key: specInput.key.trim(), 
          value: specInput.value.trim() 
        }],
      }))
      setSpecInput({ key: "", value: "" })
    }
  }

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      showLoading(isEditing ? "Updating product..." : "Creating product...")
      setLoading(true)
      const form = new FormData()

      form.append("name", formData.name)
      form.append("description", formData.description)
      form.append("price", formData.price)
      form.append("category", formData.category)
      form.append("stockQuantity", formData.stock || "0")
      form.append("specifications", JSON.stringify(formData.specifications || []))

      formData.images.forEach((img, index) => {
        if (img?.uri?.startsWith("file://")) {
          const imageFile = {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.name || `product_image_${index}_${Date.now()}.jpg`,
          }
          form.append("images", imageFile)
        }
      })

      const response = isEditing 
        ? await productsAPI.update(product._id, form) 
        : await productsAPI.create(form)

      setLoading(false)

      if (response) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Product ${isEditing ? "updated" : "created"} successfully`
        })
        navigation.goBack()
      }
    } catch (err) {
      const msg = err.response?.data?.message ||
        err.response?.data?.errors?.map(e => e.msg).join(", ") ||
        err.message ||
        "Failed to save product"
      Toast.show({ type: "error", text1: "Error", text2: msg })
    } finally {
      hideLoading()
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>
              {isEditing ? "Edit Product" : "Add New Product"}
            </Text>

            {/* Enhanced Images Section */}
            <View>
              <Text style={styles.sectionTitle}>Product Images *</Text>
              <Text style={styles.sectionSubtitle}>
                Add up to 5 high-quality images ({formData.images.length}/5)
              </Text>
              
              {formData.images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.imagesContainer}
                  contentContainerStyle={styles.imagesContentContainer}
                >
                  {formData.images.map((img, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Pressable onPress={() => setFullscreenImage(img.uri || img.url)}>
                        <Image 
                          source={{ uri: img.uri || img.url }} 
                          style={styles.image} 
                          resizeMode="cover" 
                        />
                        {index === 0 && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </Pressable>
                      
                      <View style={styles.imageActions}>
                        <IconButton
                          icon="close"
                          size={16}
                          iconColor={theme.colors.error}
                          style={styles.removeImageIcon}
                          onPress={() => removeImage(index)}
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Button
                mode="contained"
                // onPress={() => setImagePickerVisible(true)}
                onPress={()=> handleImagePick('library')}
                icon="camera-plus"
                style={styles.addImageButton}
                disabled={formData.images.length >= 5}
              >
                {formData.images.length === 0 ? "Add Product Images" : "Add More Images"}
              </Button>
              
              {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
            </View>

            <Divider style={styles.divider} />

            {/* Form Fields */}
            <View>
              <TextInput
                label="Product Name *"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                style={styles.input}
                mode="outlined"
                error={!!errors.name}
                left={<TextInput.Icon icon="tag" />}
                maxLength={100}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TextInput
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                error={!!errors.description}
                left={<TextInput.Icon icon="text" />}
                maxLength={1000}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

              <View style={styles.rowContainer}>
                <TextInput
                  label="Price *"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  style={[styles.input, styles.halfWidth]}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.price}
                  left={<TextInput.Icon icon="currency-usd" />}
                />

                <TextInput
                  label="Stock Quantity"
                  value={formData.stock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                  style={[styles.input, styles.halfWidth]}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.stock}
                  left={<TextInput.Icon icon="package-variant" />}
                />
              </View>
              
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
            </View>

            <Divider style={styles.divider} />

            {/* Category Section */}
            <View>
              <Text style={styles.sectionTitle}>Category *</Text>
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCategoryMenuVisible(true)}
                    style={[styles.categoryButton, errors.category && styles.errorBorder]}
                    contentStyle={styles.categoryButtonContent}
                    icon="chevron-down"
                  >
                    {getCategoryName(formData.category)}
                  </Button>
                }
              >
                {categories.map((cat) => (
                  <Menu.Item
                    key={cat._id}
                    title={cat.name}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, category: cat._id }))
                      setCategoryMenuVisible(false)
                    }}
                  />
                ))}
              </Menu>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              icon={isEditing ? "content-save" : "plus"}
            >
              {loading ? "Loading..." : isEditing ? "Update Product" : "Create Product"}
            </Button>
          </Card.Content>
        </Card>

        {/* Fullscreen Image Modal */}
        <Modal visible={!!fullscreenImage} transparent animationType="fade" statusBarTranslucent presentationStyle="overFullScreen">
          <Pressable style={styles.modalOverlay} onPress={() => setFullscreenImage(null)}>
            <View style={styles.modalContent}>
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                style={styles.closeButton}
                onPress={() => setFullscreenImage(null)}
              />
              <Image
                source={{ uri: fullscreenImage }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </Modal>
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
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  
  // Images Section
  imagesContainer: {
    marginBottom: spacing.md,
  },
  imagesContentContainer: {
    paddingRight: spacing.md,
  },
  imageWrapper: {
    marginRight: spacing.md,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surfaceVariant,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  imageActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: -8,
    right: -8,
  },
  removeImageIcon: {
    backgroundColor: theme.colors.surface,
    margin: 0,
  },
  addImageButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  
  // Form Styles
  input: {
    marginBottom: spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  rowContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
  },
  
  // Category Styles
  categoryButton: {
    borderColor: theme.colors.outline,
    marginBottom: spacing.sm,
  },
  categoryButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  errorBorder: {
    borderColor: theme.colors.error,
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
})