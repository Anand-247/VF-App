"use client"
import { useState, useCallback, useEffect } from "react"
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert, 
  Modal, 
  Dimensions, 
  TouchableOpacity,
  ScrollView 
} from "react-native"
import { 
  Text, 
  Card, 
  FAB, 
  Searchbar, 
  Menu, 
  IconButton, 
  Chip, 
  Button 
} from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { productsAPI, categoriesAPI } from "../../services/api"
import LoadingScreen from "../../components/LoadingScreen"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [menuVisible, setMenuVisible] = useState({})
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ])
      if (productsRes.products) {
        setProducts(productsRes.products)
        setFilteredProducts(productsRes.products)
      }
      if (categoriesRes) {
        setCategories(categoriesRes)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load products",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    filterProducts(query, selectedCategory)
  }

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId)
    filterProducts(searchQuery, categoryId)
  }

  const filterProducts = (query, categoryId) => {
    let filtered = products
    if (categoryId !== "all") {
      filtered = filtered.filter(
        (product) => product.category?._id === categoryId
      )
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q)
      )
    }
    setFilteredProducts(filtered)
  }

  const handleDelete = (product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProduct(product._id),
        },
      ]
    )
  }

  const deleteProduct = async (id) => {
    try {
      const response = await productsAPI.delete(id)
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product deleted successfully",
        })
        loadData()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete product",
      })
    }
  }

  const toggleMenu = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const openImageViewer = (images, index = 0) => {
    setSelectedImages(images || [])
    setCurrentImageIndex(index)
    setImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setImageViewerVisible(false)
    setSelectedImages([])
    setCurrentImageIndex(0)
  }

  const ImageViewer = () => (
    <Modal
      visible={imageViewerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeImageViewer}
    >
      <View style={styles.imageViewerContainer}>
        <View style={styles.imageViewerHeader}>
          <Text style={styles.imageCounter}>
            {currentImageIndex + 1} / {selectedImages.length}
          </Text>
          <IconButton
            icon="close"
            iconColor={theme.colors.onPrimary}
            size={24}
            onPress={closeImageViewer}
          />
        </View>
        
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth)
            setCurrentImageIndex(index)
          }}
          contentOffset={{ x: currentImageIndex * screenWidth, y: 0 }}
        >
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageViewerSlide}>
              <TouchableOpacity
                style={styles.imageViewerImageContainer}
                activeOpacity={1}
              >
                <Card.Cover
                  source={{ uri: image.url }}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.imageViewerDots}>
          {selectedImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentImageIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  )

  const ProductCard = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{ 
            uri: item.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image' 
          }}
          style={styles.cardImage}
        />
        
        {/* Image count indicator */}
        {item.images && item.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <MaterialCommunityIcons 
              name="image-multiple" 
              size={12} 
              color={theme.colors.onPrimary} 
            />
            <Text style={styles.imageCountText}>{item.images.length}</Text>
          </View>
        )}

        {/* View button overlay */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => openImageViewer(item.images, 0)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="eye" 
            size={20} 
            color={theme.colors.onPrimary} 
          />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            {/* Product name and menu */}
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Menu
                visible={menuVisible[item._id]}
                onDismiss={() => toggleMenu(item._id)}
                anchor={
                  <IconButton 
                    icon="dots-vertical" 
                    size={20}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => toggleMenu(item._id)} 
                  />
                }
              >
                <Menu.Item 
                  onPress={() => { 
                    toggleMenu(item._id); 
                    navigation.navigate("ProductForm", { product: item }) 
                  }} 
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Menu.Item 
                  onPress={() => { 
                    toggleMenu(item._id); 
                    handleDelete(item) 
                  }} 
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>

            {/* Category chip */}
            <View style={styles.categoryContainer}>
              <Chip 
                mode="outlined" 
                compact 
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {item.category?.name || "Uncategorized"}
              </Chip>
            </View>

            {/* Description */}
            <Text style={styles.productDescription} numberOfLines={3}>
              {item.description}
            </Text>

            {/* Price and stock info */}
            <View style={styles.bottomRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{item.price?.toLocaleString()}</Text>
                {item.originalPrice && item.originalPrice > item.price && (
                  <Text style={styles.originalPrice}>₹{item.originalPrice?.toLocaleString()}</Text>
                )}
              </View>
              
              {item.stock !== undefined && (
                <View style={styles.stockContainer}>
                  <MaterialCommunityIcons 
                    name="package-variant" 
                    size={14} 
                    color={item.stock > 0 ? theme.colors.success : theme.colors.error} 
                  />
                  <Text style={[
                    styles.stockText,
                    { color: item.stock > 0 ? theme.colors.success : theme.colors.error }
                  ]}>
                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  )

  if (loading) return <LoadingScreen text="Loading products..." />

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
        />
        <View style={styles.categoryFilters}>
          <Chip 
            selected={selectedCategory === "all"} 
            onPress={() => handleCategoryFilter("all")} 
            style={[
              styles.categoryFilterChip,
              selectedCategory === "all" && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryFilterText,
              selectedCategory === "all" && styles.selectedCategoryText
            ]}
          >
            All
          </Chip>
          {categories.map((c) => (
            <Chip 
              key={c._id} 
              selected={selectedCategory === c._id} 
              onPress={() => handleCategoryFilter(c._id)} 
              style={[
                styles.categoryFilterChip,
                selectedCategory === c._id && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryFilterText,
                selectedCategory === c._id && styles.selectedCategoryText
              ]}
            >
              {c.name}
            </Chip>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard item={item} />}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => navigation.navigate("ProductForm")}
        color={theme.colors.onPrimary}
      />

      <ImageViewer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  filtersContainer: { 
    padding: spacing.md, 
    backgroundColor: theme.colors.surface, 
    ...shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20'
  },
  searchbar: { 
    backgroundColor: theme.colors.surfaceVariant, 
    marginBottom: spacing.md,
    elevation: 0,
    borderRadius: theme.roundness * 2
  },
  categoryFilters: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    marginBottom: spacing.sm 
  },
  categoryFilterChip: { 
    marginRight: spacing.sm, 
    marginBottom: spacing.xs,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary
  },
  categoryFilterText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500'
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  listContainer: { 
    padding: spacing.md, 
    paddingBottom: 100 
  },
  
  // Enhanced card styles
  card: { 
    marginBottom: spacing.lg, 
    borderRadius: theme.roundness * 2, 
    overflow: "hidden", 
    backgroundColor: theme.colors.surface, 
    ...shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.outline + '15'
  },
  
  imageContainer: {
    position: 'relative'
  },
  
  cardImage: { 
    width: '100%', 
    height: 240, 
    backgroundColor: theme.colors.surfaceVariant
  },
  
  imageCountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: theme.colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: theme.roundness * 1.5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  imageCountText: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2
  },
  
  viewButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: theme.colors.primary + 'CC', // 80% opacity
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: theme.roundness * 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  viewButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  
  cardContent: { 
    padding: spacing.lg 
  },
  
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  
  cardInfo: { 
    flex: 1 
  },
  
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  
  productName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: theme.colors.onSurface, 
    lineHeight: 24,
    flex: 1,
    marginRight: spacing.sm
  },
  
  categoryContainer: {
    marginBottom: spacing.sm
  },
  
  categoryChip: {
    backgroundColor: theme.colors.primaryContainer,
    alignSelf: 'flex-start',
    borderColor: theme.colors.primary + '30'
  },
  
  categoryChipText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  
  productDescription: { 
    fontSize: 14, 
    color: theme.colors.onSurfaceVariant, 
    lineHeight: 20, 
    marginBottom: spacing.md
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  
  priceContainer: { 
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1
  },
  
  price: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: theme.colors.primary,
    marginRight: spacing.sm
  },
  
  originalPrice: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textDecorationLine: 'line-through'
  },
  
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: theme.roundness
  },
  
  stockText: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '500'
  },
  
  fab: { 
    position: 'absolute', 
    right: spacing.lg, 
    bottom: spacing.lg, 
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness * 2
  },

  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center'
  },
  
  imageViewerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 1
  },
  
  imageCounter: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  
  imageViewerSlide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  imageViewerImageContainer: {
    width: screenWidth - spacing.xl,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  imageViewerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
  
  imageViewerDots: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4
  },
  
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5
  }
})