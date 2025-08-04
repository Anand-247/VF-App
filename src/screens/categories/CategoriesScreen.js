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
  Platform // Added Platform for platform-specific shadows
} from "react-native"
import {
  Text,
  Card,
  FAB,
  Searchbar,
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
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
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
        setCategories((prev) => prev.filter((cat) => cat._id !== id))
        setFilteredCategories((prev) => prev.filter((cat) => cat._id !== id))
        // loadCategories()
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
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
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
    <Card style={styles.card} elevation={2}>
      <TouchableOpacity style={styles.cardTouchable} onPress={() => openImageViewer(item)}>
        <View style={styles.imageContainer}>
          <Card.Cover
            source={
              item.image?.url
                ? { uri: item.image.url }
                : require('../../../assets/imagePlaceholder.jpg')
            }
            style={styles.cardImage}
          />

          {/* Product count badge */}
          {item.productCount !== undefined && (
            <View style={styles.productCountBadge}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={14}
                color={theme.colors.onPrimary}
              />
              <Text style={styles.productCountText}>
                {item.productCount}
              </Text>
            </View>
          )}

          {/* Featured badge */}
          {item.featured && (
            <View style={styles.featuredBadge}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={14}
                color={theme.colors.onSecondary}
              />
            </View>
          )}

          {/* Action buttons on top right of image */}
          <View style={styles.cardImageActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              containerColor={theme.colors.surface} // Background for icon
              onPress={() => navigation.navigate("CategoryForm", { category: item })}
              style={styles.imageActionButton}
              rippleColor={theme.colors.primaryContainer}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              containerColor={theme.colors.surface} // Background for icon
              onPress={() => handleDelete(item)}
              style={styles.imageActionButton}
              rippleColor={theme.colors.errorContainer}
            />
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.categoryDescription} numberOfLines={3}>
            {item.description || "No description available"}
          </Text>

          {/* Tags section */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <View style={styles.tagsWrapper}>
                {item.tags.slice(0, 3).map((tag, i) => (
                  <Chip
                    key={i}
                    mode="flat"
                    compact
                    style={styles.tag}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
                {item.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>
                    +{item.tags.length - 3}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Bottom info: Date and Status */}
          <View style={styles.bottomInfoRow}>
            {item.createdAt && (
              <View style={styles.dateContainer}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {item.isActive !== undefined && (
              <Chip
                mode="flat"
                compact
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: item.isActive
                      ? theme.colors.success + '20'
                      : theme.colors.error + '20',
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
        </Card.Content>
      </TouchableOpacity>
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
          theme={{ colors: { onSurfaceVariant: theme.colors.onSurfaceVariant } }}
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
                onPress={() => navigation.navigate("CategoryFormModal")}
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
        onPress={() => navigation.navigate("CategoryFormModal")}
        color={theme.colors.onPrimary}
      />

      <ImageViewer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    borderRadius: theme.roundness * 2,
    borderWidth: 1,
    borderColor: theme.colors.outline + '40',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 100
  },

  // --- Category Card Styles ---
  card: {
    marginBottom: spacing.lg,
    borderRadius: theme.roundness * 2, // Slightly more rounded for softness
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    // Modern, subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5, // Android elevation
      },
    }),
  },
  cardTouchable: { // Wrapper for the entire card content to make it fully touchable
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 180, // Fixed height for consistency
    borderTopLeftRadius: theme.roundness * 2,
    borderTopRightRadius: theme.roundness * 2,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant, // Placeholder background
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensures image covers the area
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
    alignItems: 'center',
    gap: spacing.xs / 2, // Small gap for icon and text
    ...shadows.small,
  },
  productCountText: {
    color: theme.colors.onPrimary,
    fontSize: 11,
    fontWeight: '600',
  },

  featuredBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: theme.colors.secondary,
    width: 32, // Slightly larger
    height: 32,
    borderRadius: 16, // Circular
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
    margin: 0, // Override default margin
    borderRadius: theme.roundness * 1.5,
    // More pronounced shadow for actions on image
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
    padding: spacing.lg, // Consistent padding inside content area
  },

  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  tagsContainer: {
    marginBottom: spacing.md,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.roundness,
    paddingHorizontal: spacing.sm, // More padding for chip text
    paddingVertical: spacing.xs / 2,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  moreTagsText: {
    fontStyle: 'italic',
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
    alignSelf: 'center',
    marginLeft: spacing.xs,
    marginTop: spacing.xs / 2,
  },

  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // Gap for icon and text
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  statusChip: {
    borderRadius: theme.roundness,
    borderColor: 'transparent',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Empty State Styles (no changes) ---
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

  // --- FAB Styles (no changes) ---
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness * 2
  },

  // --- Image Viewer Styles (no changes) ---
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