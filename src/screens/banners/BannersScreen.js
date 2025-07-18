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
  const [menuVisible, setMenuVisible] = useState({})
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
      `Are you sure you want to delete "${banner.title}"?`, 
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
        loadBanners()
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

  const toggleMenu = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
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
            </View>
          )}
        </View>
      </View>
    </Modal>
  )

  const BannerCard = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <TouchableOpacity style={styles.imageContainer} onPress={() => openImageViewer(item)}>
        <Card.Cover 
          source={{ 
            uri: item.image?.url || "https://via.placeholder.com/400x200?text=No+Image" 
          }} 
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
              name="link" 
              size={12} 
              color={theme.colors.onSecondary} 
            />
          </View>
        )}
      </TouchableOpacity>

      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            {/* Title and menu */}
            <View style={styles.titleRow}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
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
                    navigation.navigate("BannerForm", { banner: item })
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
            <Text style={styles.bannerDescription} numberOfLines={3}>
              {item.description || "No description available"}
            </Text>

            {/* Bottom info */}
            <View style={styles.bottomRow}>
              <View style={styles.infoContainer}>
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
                      name="calendar" 
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
            </View>
          </View>
        </View>
      </Card.Content>
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
                onPress={() => navigation.navigate("BannerForm")}
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
        onPress={() => navigation.navigate("BannerForm")}
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
    borderRadius: theme.roundness * 2
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  
  // Enhanced card styles
  card: {
    marginBottom: spacing.lg,
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
    borderRadius: theme.roundness * 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.outline + '15'
  },
  
  imageContainer: {
    position: 'relative'
  },
  
  cardImage: {
    height: 160,
    backgroundColor: theme.colors.surfaceVariant
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
    ...shadows.small
  },
  
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs
  },
  
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onSurface
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
  
  linkBadge: {
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
    padding: spacing.lg,
  },
  
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  
  cardInfo: {
    flex: 1,
  },
  
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.onSurface,
    lineHeight: 24,
    flex: 1,
    marginRight: spacing.sm
  },
  
  bannerDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
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
  
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  
  linkText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '500',
    marginLeft: spacing.xs
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
    position: "absolute",
    margin: spacing.lg,
    right: 0,
    bottom: 0,
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
    textAlign: 'center'
  }
})