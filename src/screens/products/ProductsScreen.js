// ProductsScreen.js - Updated with Modal Navigation
"use client"
import React, { useState, useCallback, useEffect } from "react"
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert, 
  Modal, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  Platform
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
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)

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
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
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
        setProducts((prev) => prev.filter((product) => product._id !== id))
        setFilteredProducts((prev) => prev.filter((product) => product._id !== id))
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

  const openImageViewer = (product, index = 0) => {
    setSelectedProduct(product)
    setSelectedImages(product.images || [])
    setCurrentImageIndex(index)
    setImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setImageViewerVisible(false)
    setSelectedImages([])
    setCurrentImageIndex(0)
    setSelectedProduct(null)
  }

  const ProductCard = ({ item }) => (
    <Card style={styles.card} elevation={2}>
      <TouchableOpacity style={styles.cardTouchable} onPress={() => openImageViewer(item, 0)}>
        <View style={styles.imageContainer}>
          <Card.Cover
            source={
              item.images?.[0]?.url
                ? { uri: item.images?.[0]?.url }
                : require('../../../assets/imagePlaceholder.jpg')
            }
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

          {/* Stock status badge */}
          {item.stock !== undefined && (
            <View style={[
              styles.stockBadge, 
              { backgroundColor: item.stock > 0 ? theme.colors.success : theme.colors.error }
            ]}>
              <MaterialCommunityIcons 
                name={item.stock > 0 ? "check-circle" : "alert-circle"} 
                size={12} 
                color={theme.colors.onPrimary} 
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.cardImageActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              containerColor={theme.colors.surface}
              onPress={() => navigation.navigate("ProductFormModal", { product: item })}
              style={styles.imageActionButton}
              rippleColor={theme.colors.primaryContainer}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              containerColor={theme.colors.surface}
              onPress={() => handleDelete(item)}
              style={styles.imageActionButton}
              rippleColor={theme.colors.errorContainer}
            />
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/* Product name */}
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Chip 
                mode="flat" 
                compact 
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {item.category?.name || "Uncategorized"}
              </Chip>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.productDescription} numberOfLines={3}>
            {item.description || "No description available"}
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
                  {item.stock > 0 ? `${item.stock}` : 'Out'}
                </Text>
              </View>
            )}
          </View>

          {/* Date added */}
          {item.createdAt && (
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={12}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dateText}>
                Added {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
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
          theme={{ colors: { onSurfaceVariant: theme.colors.onSurfaceVariant } }}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryFilters}
          contentContainerStyle={styles.categoryFiltersContent}
        >
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
            All Products
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
        </ScrollView>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={64}
                color={theme.colors.primary + '60'}
              />
            </View>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first product to get started"
              }
            </Text>
            {!searchQuery && selectedCategory === "all" && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate("ProductFormModal")}
                style={styles.emptyButton}
                icon="plus"
              >
                Add Product
              </Button>
            )}
          </View>
        }
      />

      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => navigation.navigate("ProductFormModal")}
        color={theme.colors.onPrimary}
      />

      <ImageViewer
        visible={imageViewerVisible}
        onClose={closeImageViewer}
        images={selectedImages}
        initialIndex={currentImageIndex}
        product={selectedProduct}
      />
    </View>
  )
}

const ImageViewer = React.memo(({ visible, images = [], initialIndex = 0, onClose, product }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = React.useRef();

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);

      // Scroll only after the view is rendered (in next tick)
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: initialIndex * screenWidth, animated: false });
        }
      }, 0);
    }
  }, [visible, initialIndex]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.imageViewerContainer}>
        {/* Top header */}
        <View style={styles.imageViewerHeader}>
          <View style={styles.imageViewerHeaderLeft}>
            <Text style={styles.imageViewerTitle}>{product?.name}</Text>
            <Text style={styles.imageCounter}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
          <IconButton
            icon="close"
            iconColor={theme.colors.onPrimary}
            size={24}
            onPress={onClose}
          />
        </View>

        {/* Scrollable images */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentIndex(index);
          }}
        >
          {images.map((img, index) => (
            <View key={index} style={styles.imageViewerSlide}>
              <TouchableOpacity activeOpacity={1} style={styles.imageViewerImageContainer}>
                <Card.Cover
                  source={{ uri: img.url }}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
});


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
    borderRadius: theme.roundness * 2,
    borderWidth: 1,
    borderColor: theme.colors.outline + '40',
  },
  categoryFilters: { 
    marginBottom: spacing.sm 
  },
  categoryFiltersContent: {
    paddingRight: spacing.md,
  },
  categoryFilterChip: { 
    marginRight: spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline + '40',
    borderWidth: 1,
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
    borderRadius: theme.roundness * 2.5, 
    overflow: "hidden", 
    backgroundColor: theme.colors.surface, 
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  cardTouchable: {
    flex: 1,
  },
  
  imageContainer: {
    position: 'relative',
    height: 220,
    borderTopLeftRadius: theme.roundness * 2,
    borderTopRightRadius: theme.roundness * 2,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant,
  },
  
  cardImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
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
    alignItems: 'center',
    gap: spacing.xs / 2,
    ...shadows.small,
  },
  
  imageCountText: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  
  stockBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  
  cardImageActions: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  
  imageActionButton: {
    margin: 0,
    borderRadius: theme.roundness * 1.5,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  cardContent: { 
    padding: spacing.lg 
  },
  
  productName: { 
    flex: 1,
    fontSize: 18, 
    fontWeight: '700', 
    color: theme.colors.onSurface, 
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  
  categoryContainer: {
    marginBottom: spacing.sm
  },
  
  categoryChip: {
    backgroundColor: theme.colors.primaryContainer,
    alignSelf: 'flex-start',
    borderColor: 'transparent',
  },
  
  categoryChipText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  
  productDescription: { 
    fontSize: 14, 
    color: theme.colors.onSurfaceVariant, 
    lineHeight: 22, 
    marginBottom: spacing.md
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  
  priceContainer: { 
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1
  },
  
  price: { 
    fontSize: 24, 
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
    borderRadius: theme.roundness,
  },
  
  stockText: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '600'
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  dateText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  emptyButton: {
    marginTop: spacing.md,
    backgroundColor: theme.colors.primary
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
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    zIndex: 1
  },
  
  imageViewerHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  imageViewerTitle: {
    color: theme.colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  imageCounter: {
    color: theme.colors.onPrimary + 'CC',
    fontSize: 14,
    fontWeight: '500'
  },
  
  imageViewerSlide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  imageViewerImageContainer: {
    width: screenWidth - spacing.xl,
    height: screenHeight * 0.6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  imageViewerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
})