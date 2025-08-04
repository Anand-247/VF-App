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
  ScrollView,
  Linking
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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { useFocusEffect } from "@react-navigation/native"
import { contactsAPI } from "../../services/api"
import LoadingScreen from "../../components/LoadingScreen"
import { theme, spacing, shadows } from "../../theme/theme"
import Toast from "react-native-toast-message"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function QueriesScreen({ navigation }) {
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [menuVisible, setMenuVisible] = useState({})
  const [detailViewerVisible, setDetailViewerVisible] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)

  useFocusEffect(
    useCallback(() => {
      loadQueries()
    }, [])
  )

  const loadQueries = async () => {
    try {
      const response = await contactsAPI.getAll()
      if (response && response.contacts) {
        setQueries(response.contacts)
        setFilteredQueries(response.contacts)
      }
    } catch (error) {
      console.error("Error loading queries:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load queries",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadQueries()
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredQueries(queries)
    } else {
      const filtered = queries.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.email?.toLowerCase().includes(query.toLowerCase()) ||
          contact.phone?.toLowerCase().includes(query.toLowerCase()) ||
          contact.message?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredQueries(filtered)
    }
  }

  const handleDelete = (query) => {
    Alert.alert(
      "Delete Query", 
      `Are you sure you want to delete query from "${query.name}"?`, 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteQuery(query._id),
        },
      ]
    )
  }

  const deleteQuery = async (id) => {
    try {
      const response = await contactsAPI.delete(id)
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Query deleted successfully",
        })
        setQueries(prev => prev.filter(query => query._id !== id))
        setFilteredQueries(prev => prev.filter(query => query._id !== id))
      }
    } catch (error) {
      console.error("Error deleting query:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete query",
      })
    }
  }

  const toggleMenu = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const openDetailViewer = (query) => {
    setSelectedQuery(query)
    setDetailViewerVisible(true)
  }

  const closeDetailViewer = () => {
    setDetailViewerVisible(false)
    setSelectedQuery(null)
  }

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`)
    }
  }

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`)
    }
  }

  const getTimeDifference = (createdAt) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return created.toLocaleDateString()
  }

  const DetailViewer = () => (
    <Modal
      visible={detailViewerVisible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={closeDetailViewer}
    >
      <View style={styles.detailViewerContainer}>
        <View style={styles.detailViewerHeader}>
          <Text style={styles.detailViewerTitle}>
            Query Details
          </Text>
          <IconButton
            icon="close"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={closeDetailViewer}
          />
        </View>
        
        <ScrollView style={styles.detailViewerContent} showsVerticalScrollIndicator={false}>
          {selectedQuery && (
            <View style={styles.detailContainer}>
              {/* Contact Info Card */}
              <Card style={styles.detailCard}>
                <Card.Content style={styles.detailCardContent}>
                  <View style={styles.detailHeader}>
                    <View style={styles.avatarContainer}>
                      <MaterialCommunityIcons 
                        name="account-circle" 
                        size={48} 
                        color={theme.colors.primary} 
                      />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{selectedQuery.name}</Text>
                      <Text style={styles.contactTime}>
                        {getTimeDifference(selectedQuery.createdAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactDetails}>
                    <TouchableOpacity 
                      style={styles.contactDetailItem}
                      onPress={() => handleEmail(selectedQuery.email)}
                    >
                      <MaterialCommunityIcons 
                        name="email" 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.contactDetailText}>{selectedQuery.email}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.contactDetailItem}
                      onPress={() => handleCall(selectedQuery.phone)}
                    >
                      <MaterialCommunityIcons 
                        name="phone" 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.contactDetailText}>{selectedQuery.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>

              {/* Message Card */}
              <Card style={styles.detailCard}>
                <Card.Content style={styles.detailCardContent}>
                  <Text style={styles.messageTitle}>Message</Text>
                  <Text style={styles.messageContent}>
                    {selectedQuery.message || "No message provided"}
                  </Text>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  icon="phone"
                  onPress={() => handleCall(selectedQuery.phone)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Call
                </Button>
                <Button
                  mode="contained"
                  icon="email"
                  onPress={() => handleEmail(selectedQuery.email)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Email
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )

  const QueryCard = ({ item }) => (
    <Card style={styles.card} elevation={3}>
      <TouchableOpacity onPress={() => openDetailViewer(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              {/* Header Row */}
              <View style={styles.titleRow}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarSmall}>
                    <MaterialCommunityIcons 
                      name="account" 
                      size={24} 
                      color={theme.colors.onPrimary} 
                    />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                </View>
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
                      handleCall(item.phone)
                    }}
                    title="Call"
                    leadingIcon="phone"
                  />
                  <Menu.Item
                    onPress={() => {
                      toggleMenu(item._id)
                      handleEmail(item.email)
                    }}
                    title="Email"
                    leadingIcon="email"
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

              {/* Message Preview */}
              <Text style={styles.messagePreview} numberOfLines={3}>
                {item.message || "No message provided"}
              </Text>

              {/* Bottom Row */}
              <View style={styles.bottomRow}>
                <View style={styles.infoContainer}>
                  <View style={styles.phoneContainer}>
                    <MaterialCommunityIcons 
                      name="phone" 
                      size={14} 
                      color={theme.colors.secondary} 
                    />
                    <Text style={styles.phoneText}>{item.phone}</Text>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={14} 
                      color={theme.colors.onSurfaceVariant} 
                    />
                    <Text style={styles.dateText}>
                      {getTimeDifference(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <Chip 
                  mode="outlined"
                  compact
                  style={[
                    styles.statusChip,
                    { 
                      backgroundColor: theme.colors.primaryContainer,
                      borderColor: theme.colors.primary
                    }
                  ]}
                  textStyle={[
                    styles.statusChipText,
                    { color: theme.colors.primary }
                  ]}
                >
                  New Query
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  )

  if (loading) {
    return <LoadingScreen text="Loading queries..." />
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search queries..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
        />
      </View>

      <FlatList
        data={filteredQueries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <QueryCard item={item} />}
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
                name="message-text-outline" 
                size={64} 
                color={theme.colors.primary + '60'} 
              />
            </View>
            <Text style={styles.emptyText}>No queries found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "No customer queries available at the moment"
              }
            </Text>
          </View>
        }
      />

      <DetailViewer />
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
    alignItems: 'center',
    marginBottom: spacing.md
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  
  userDetails: {
    flex: 1
  },
  
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  
  userEmail: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2
  },
  
  messagePreview: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
    fontStyle: 'italic'
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
  
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  
  phoneText: {
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

  // Detail Viewer Styles
  detailViewerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 50
  },
  
  detailViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20'
  },
  
  detailViewerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  
  detailViewerContent: {
    flex: 1,
  },
  
  detailContainer: {
    padding: spacing.lg
  },
  
  detailCard: {
    marginBottom: spacing.lg,
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
    borderRadius: theme.roundness * 2,
    borderWidth: 1,
    borderColor: theme.colors.outline + '15'
  },
  
  detailCardContent: {
    padding: spacing.lg
  },
  
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  
  avatarContainer: {
    marginRight: spacing.lg
  },
  
  contactInfo: {
    flex: 1
  },
  
  contactName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs
  },
  
  contactTime: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant
  },
  
  contactDetails: {
    gap: spacing.md
  },
  
  contactDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  
  contactDetailText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginLeft: spacing.md,
    flex: 1
  },
  
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md
  },
  
  messageContent: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md
  },
  
  actionButton: {
    flex: 1,
    borderRadius: theme.roundness * 2
  },
  
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600'
  }
})