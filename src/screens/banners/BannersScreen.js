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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { useFocusEffect } from "@react-navigation/native"
import { bannersAPI } from "../../services/api"
import LoadingScreen from "../../components/LoadingScreen"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function BannersScreen({ navigation }) {
  const [banners, setBanners] = useState([])
  const [filteredBanners, setFilteredBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)

  useFocusEffect(
    useCallback(() => {
      loadBanners()
    }, [])
  )

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.getAll()
      if (response) {
        setBanners(response)
        setFilteredBanners(response)
      }
    } catch (error) {
      console.error("Error loading banners:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load banners",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadBanners()
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredBanners(banners)
    } else {
      const filtered = banners.filter(
        (banner) =>
          banner.title.toLowerCase().includes(query.toLowerCase()) ||
          banner.description?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredBanners(filtered)
    }
  }

  const handleDelete = (banner) => {
    Alert.alert(
      "Delete Banner", 
      `Are you sure you want to delete "${banner.title}"? This action cannot be undone.`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBanner(banner._id),
        },
      ]
    )
  }

  const deleteBanner = async (id) => {
    try {
      const response = await bannersAPI.delete(id)
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Banner deleted successfully",
        })
        setBanners((prev) => prev.filter((banner) => banner._id !== id))
        setFilteredBanners((prev) => prev.filter((banner) => banner._id !== id))
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete banner",
      })
    }
  }

  const openImageViewer = (banner) => {
    setSelectedBanner(banner)
    setImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setImageViewerVisible(false)
    setSelectedBanner(null)
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
            {selectedBanner?.title}
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
                uri: selectedBanner?.image?.url || 'https://via.placeholder.com/400x200?text=No+Image' 
              }}
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          {selectedBanner?.description && (
            <View style={styles.imageViewerInfo}>
              <Text style={styles.imageViewerDescription}>
                {selectedBanner.description}
              </Text>
              {selectedBanner?.link && (
                <View style={styles.imageViewerLinkContainer}>
                  <MaterialCommunityIcons 
                    name="link-variant" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.imageViewerLinkText}>
                    Has Link
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )

  const BannerCard = ({ item }) => (
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
          
          {/* Status badge */}
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.isActive ? theme.colors.success : theme.colors.error }
            ]} />
            <Text style={styles.statusBadgeText}>
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>

          {/* Link indicator */}
          {item.link && (
            <View style={styles.linkBadge}>
              <MaterialCommunityIcons 
                name="link-variant" 
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
              containerColor={theme.colors.surface}
              onPress={() => navigation.navigate("BannerFormModal", { banner: item })}
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
          <Text style={styles.bannerTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.bannerDescription} numberOfLines={3}>
            {item.description || "No description available"}
          </Text>

          {/* Bottom info: Date and Status */}
          <View style={styles.bottomInfoRow}>
            <View style={styles.leftInfo}>
              {item.link && (
                <View style={styles.linkContainer}>
                  <MaterialCommunityIcons 
                    name="link-variant" 
                    size={14} 
                    color={theme.colors.secondary} 
                  />
                  <Text style={styles.linkText}>Has Link</Text>
                </View>
              )}
              
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
            </View>

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
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  )

  if (loading) {
    return <LoadingScreen text="Loading banners..." />
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search banners..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
          theme={{ colors: { onSurfaceVariant: theme.colors.onSurfaceVariant } }}
        />
      </View>

      <FlatList
        data={filteredBanners}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BannerCard item={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons 
                name="image-outline" 
                size={64} 
                color={theme.colors.primary + '60'} 
              />
            </View>
            <Text style={styles.emptyText}>No banners found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Add your first banner to get started"
              }
            </Text>
            {!searchQuery && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate("BannerFormModal")}
                style={styles.emptyButton}
                icon="plus"
              >
                Add Banner
              </Button>
            )}
          </View>
        }
      />

      <FAB 
        icon="plus" 
        style={styles.fab} 
        onPress={() => navigation.navigate("BannerFormModal")}
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
    paddingBottom: 100,
  },
  
  // --- Banner Card Styles ---
  card: {
    marginBottom: spacing.lg,
    borderRadius: theme.roundness * 2.5, // Slightly more rounded for softness
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
  
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: theme.colors.surface + 'E6', // 90% opacity
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: theme.roundness * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2, // Small gap for icon and text
    ...shadows.small,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface
  },
  
  linkBadge: {
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
  
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  
  bannerDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  
  bottomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  
  leftInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // Gap for icon and text
    marginBottom: spacing.xs,
  },
  linkText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '500',
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
  
  // --- Empty State Styles ---
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
  
  // --- FAB Styles ---
  fab: {
    position: "absolute",
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness * 2
  },

  // --- Image Viewer Styles ---
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
    height: screenHeight * 0.6,
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
  imageViewerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageViewerLinkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500'
  }
})