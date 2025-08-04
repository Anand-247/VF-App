"use client"
import { View, StyleSheet, ScrollView } from "react-native"
import { Text, Card, Button, Avatar, Divider } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../context/AuthContext"
import { theme, spacing, shadows } from "../../theme/theme"

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const ProfileItem = ({ icon, title, value }) => (
    <View style={styles.profileItem}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.header}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        <Text style={styles.nameText}>{user?.name || "Admin User"}</Text>
        <Text style={styles.roleText}>Administrator</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <Divider style={styles.divider} />

            <ProfileItem icon="account" title="Name" value={user?.name || "Admin User"} />
            <ProfileItem icon="email" title="Email" value={user?.email || "admin@example.com"} />
            <ProfileItem icon="shield-account" title="Role" value="Administrator" />
            <ProfileItem icon="calendar" title="Member Since" value="January 2024" />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Divider style={styles.divider} />

            <View style={styles.actionsContainer}>
              <Button
                mode="outlined"
                icon="account-edit"
                onPress={() => {
                  /* Navigate to edit profile */
                }}
                style={styles.actionButton}
              >
                Edit Profile
              </Button>

              <Button
                mode="outlined"
                icon="lock-reset"
                onPress={() => {
                  /* Navigate to change password */
                }}
                style={styles.actionButton}
              >
                Change Password
              </Button>

              <Button
                mode="outlined"
                icon="cog"
                onPress={() => {
                  /* Navigate to settings */
                }}
                style={styles.actionButton}
              >
                Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>App Information</Text>
            <Divider style={styles.divider} />

            <ProfileItem icon="information" title="Version" value="1.0.0" />
            <ProfileItem icon="update" title="Last Updated" value="January 2024" />
            <ProfileItem icon="help-circle" title="Support" value="admin@vermafurniture.com" />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
        >
          Logout
        </Button>
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
    alignItems: "center",
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    backgroundColor: theme.colors.onPrimary,
    marginBottom: spacing.md,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onPrimary,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  divider: {
    marginBottom: spacing.md,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  profileItemContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  profileItemValue: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: "500",
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionButton: {
    borderColor: theme.colors.primary,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    marginTop: spacing.md,
  },
  logoutButtonContent: {
    paddingVertical: spacing.sm,
  },
})
