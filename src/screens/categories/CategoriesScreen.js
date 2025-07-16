"use client"
import { useState, useCallback } from "react"
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
import { categoriesAPI } from "../../services/api"
import LoadingScreen from "../../components/LoadingScreen"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [menuVisible, setMenuVisible] = useState({})
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useFocusEffect(
    useCallback(() => {
      loadCategories()
    }, [])
  )

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response) {
        setCategories(response)
        setFilteredCategories(response)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load categories",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadCategories()
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          category.description?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }

  const handleDelete = (category) => {
    Alert.alert(
      "Delete Category", 
      `Are you sure you want to delete "${category.name}"?`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory(category._id),
        },
      ]
    )
  }

  const deleteCategory = async (id) => {
    try {
      const response = await categoriesAPI.delete(id)
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category deleted successfully",
        })
        loadCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete category",
      })
    }
  }

  const toggleMenu = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const openImageViewer = (category) => {
    setSelectedCategory(category)
    setImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setImageViewerVisible(false)
    setSelectedCategory(null)
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
          <Text style={styles.imageViewerTitle}>
            {selectedCategory?.name}
          </Text>
          <IconButton
            icon="close"
            iconColor={theme.colors.onPrimary}
            size={24}
            onPress={closeImageViewer}
          />
        </View>
        
        <View style={styles.imageViewerContent}>
          <TouchableOpacity
            style={styles.imageViewerImageContainer}
            activeOpacity={1}
          >
            <Card.Cover
              source={{ 
                uri: selectedCategory?.image?.url || 'https://via.placeholder.com/300x300?text=No+Image' 
              }}
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          {selectedCategory?.description && (
            <View style={styles.imageViewerInfo}>
              <Text style={styles.imageViewerDescription}>
                {selectedCategory.description}
              </Text>
              {selectedCategory?.tags && selectedCategory.tags.length > 0 && (
                <View style={styles.imageViewerTags}>
                  {selectedCategory.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      mode="outlined"
                      compact
                      style={styles.imageViewerTag}
                      textStyle={styles.imageViewerTagText}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )

  const CategoryCard = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{ 
            uri: item.image?.url || 'https://via.placeholder.com/300x300?text=No+Image' 
          }}
          style={styles.cardImage}
        />
        
        {/* Product count badge */}
        {item.productCount !== undefined && (
          <View style={styles.productCountBadge}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={12} 
              color={theme.colors.onPrimary} 
            />
            <Text style={styles.productCountText}>
              {item.productCount} {item.productCount === 1 ? 'product' : 'products'}
            </Text>
          </View>
        )}

        {/* View button overlay */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => openImageViewer(item)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="eye" 
            size={18} 
            color={theme.colors.onPrimary} 
          />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        {/* Featured badge */}
        {item.featured && (
          <View style={styles.featuredBadge}>
            <MaterialCommunityIcons 
              name="star" 
              size={12} 
              color={theme.colors.onSecondary} 
            />
          </View>
        )}
      </View>

      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            {/* Title and menu */}
            <View style={styles.titleRow}>
              <Text style={styles.categoryName} numberOfLines={2}>
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
                    toggleMenu(item._id)
                    navigation.navigate("CategoryForm", { category: item })
                  }}
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Menu.Item
                  onPress={() => {
                    toggleMenu(item._id)
                    handleDelete(item)
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>

            {/* Description */}
            <Text style={styles.categoryDescription} numberOfLines={3}>
              {item.description || "No description available"}
            </Text>

            {/* Tags section */}
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <View style={styles.tagsHeader}>
                  <MaterialCommunityIcons 
                    name="tag-multiple" 
                    size={14} 
                    color={theme.colors.tertiary} 
                  />
                  <Text style={styles.tagsLabel}>Tags</Text>
                </View>
                <View style={styles.tagsWrapper}>
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <Chip 
                      key={i} 
                      mode="outlined"
                      compact
                      style={styles.tag} 
                      textStyle={styles.tagText}
                    >
                      {tag}
                    </Chip>
                  ))}
                  {item.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>
                      +{item.tags.length - 3} more
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Bottom info */}
            <View style={styles.bottomRow}>
              <View style={styles.infoContainer}>
                {item.createdAt && (
                  <View style={styles.dateContainer}>
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={14} 
                      color={theme.colors.onSurfaceVariant} 
                    />
                    <Text style={styles.dateText}>
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              {item.isActive !== undefined && (
                <Chip 
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    { 
                      backgroundColor: item.isActive 
                        ? theme.colors.success + '20' 
                        : theme.colors.error + '20',
                      borderColor: item.isActive 
                        ? theme.colors.success 
                        : theme.colors.error
                    }
                  ]}
                  textStyle={[
                    styles.statusChipText,
                    { 
                      color: item.isActive 
                        ? theme.colors.success 
                        : theme.colors.error 
                    }
                  ]}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Chip>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  )

  if (loading) return <LoadingScreen text="Loading categories..." />

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search categories..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
        />
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={({ item }) => <CategoryCard item={item} />}
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
                name="shape-outline" 
                size={64} 
                color={theme.colors.primary + '60'} 
              />
            </View>
            <Text style={styles.emptyText}>No categories found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Add your first category to organize products"
              }
            </Text>
            {!searchQuery && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate("CategoryForm")}
                style={styles.emptyButton}
                icon="plus"
              >
                Add Category
              </Button>
            )}
          </View>
        }
      />

      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => navigation.navigate("CategoryForm")}
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
  searchContainer: { 
    padding: spacing.md, 
    backgroundColor: theme.colors.surface, 
    ...shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20'
  },
  searchbar: { 
    backgroundColor: theme.colors.surfaceVariant,
    elevation: 0,
    borderRadius: theme.roundness * 2
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
    ...shadows.medium,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline + '15'
  },
  
  imageContainer: {
    position: 'relative'
  },
  
  cardImage: { 
    width: '100%', 
    height: 200, 
    backgroundColor: theme.colors.surfaceVariant
  },
  
  productCountBadge: {
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
  
  productCountText: {
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
  
  featuredBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: theme.colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
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
  
  categoryName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: theme.colors.onSurface, 
    lineHeight: 24,
    flex: 1,
    marginRight: spacing.sm
  },
  
  categoryDescription: { 
    fontSize: 14, 
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md
  },
  
  tagsContainer: {
    marginBottom: spacing.md
  },
  
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  
  tagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tertiary,
    marginLeft: spacing.xs
  },
  
  tagsWrapper: {
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },
  
  tag: { 
    marginRight: spacing.sm, 
    marginBottom: spacing.xs,
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary + '30'
  },
  
  tagText: { 
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  
  moreTagsText: { 
    fontStyle: 'italic', 
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    alignSelf: 'center',
    marginLeft: spacing.xs
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  
  infoContainer: {
    flex: 1,
    marginRight: spacing.sm
  },
  
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  dateText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginLeft: spacing.xs
  },
  
  statusChip: {
    alignSelf: 'flex-end'
  },
  
  statusChipText: {
    fontSize: 10,
    fontWeight: '600'
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 1
  },
  
  imageViewerTitle: {
    color: theme.colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md
  },
  
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  
  imageViewerImageContainer: {
    width: screenWidth - spacing.xl,
    height: screenHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  imageViewerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
  
  imageViewerInfo: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: theme.colors.surface + 'E6', // 90% opacity
    padding: spacing.lg,
    borderRadius: theme.roundness * 2,
    ...shadows.large
  },
  
  imageViewerDescription: {
    color: theme.colors.onSurface,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.md
  },
  
  imageViewerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  
  imageViewerTag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary + '50'
  },
  
  imageViewerTagText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '500'
  }
})