// DashboardScreen.js - Updated to use Modal Navigation
import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, RefreshControl, Linking } from "react-native"
import { Text, Card, Button } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Entypo } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../context/AuthContext"
import { categoriesAPI, productsAPI, bannersAPI } from "../../services/api"
import { theme, spacing, shadows } from "../../theme/theme"

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    banners: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [categoriesRes, productsRes, bannersRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll(),
        bannersAPI.getAll(),
      ])

      setStats({
        categories: categoriesRes?.length || 0,
        products: productsRes.products?.length || 0,
        banners: bannersRes?.length || 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadStats()
  }

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <MaterialCommunityIcons name={icon} size={40} color={color} />
      </Card.Content>
    </Card>
  )

  const QuickAction = ({ title, icon, color, onPress }) => (
    <Card style={styles.actionCard} onPress={onPress}>
      <Card.Content style={styles.actionContent}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
        <Text style={styles.actionTitle}>{title}</Text>
      </Card.Content>
    </Card>
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name || "Admin"}</Text>
          <Text style={styles.subtitleText}>Manage your furniture store</Text>
        </View>
        <View style={{color: 'white'}}>
          <Button
            mode="outlined"
            onPress={() => Linking.openURL("https://fe-vf.vercel.app")}
            style={{ marginVertical: 10, alignSelf: "flex-start", borderColor: 'white' }}
          >
            <Entypo name={'globe'} size={16} color={'white'} />
            <Text style={{ color: 'white', size: 16 }}>  Website</Text>
          </Button>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsContainer}>
          <StatCard
            title="Products"
            value={stats.products}
            icon="package-variant"
            color={theme.colors.secondary}
            onPress={() => navigation.navigate("Products")}
          />
          <StatCard
            title="Categories"
            value={stats.categories}
            icon="folder-multiple"
            color={theme.colors.primary}
            onPress={() => navigation.navigate("Categories")}
          />
          <StatCard
            title="Banners"
            value={stats.banners}
            icon="image-multiple"
            color={theme.colors.tertiary}
            onPress={() => navigation.navigate("Banners")}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsContainer}>
          <QuickAction
            title="Add Category"
            icon="folder-plus"
            color={theme.colors.primary}
            onPress={() => navigation.navigate("CategoryFormModal")}
          />
          <QuickAction
            title="Add Product"
            icon="plus-box"
            color={theme.colors.secondary}
            onPress={() => navigation.navigate("ProductFormModal")}
          />
          <QuickAction
            title="Add Banner"
            icon="image-plus"
            color={theme.colors.tertiary}
            onPress={() => navigation.navigate("BannerFormModal")}
          />
          <QuickAction
            title="Queries"
            icon="clipboard-list"
            color={theme.colors.info}
            onPress={() => {
              navigation.navigate("Queries"), {
                screen: "QueriesScreen",
              }
            }}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    padding: spacing.lg,
    paddingTop: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.9,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onPrimary,
    marginTop: spacing.xs,
  },
  subtitleText: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onBackground,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  statsContainer: {
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    ...shadows.small,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statTitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    flex: 1,
    minWidth: "45%",
    ...shadows.small,
  },
  actionContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
    marginTop: spacing.sm,
    textAlign: "center",
  },
})