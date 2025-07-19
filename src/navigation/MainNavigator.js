import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { theme } from "../theme/theme"
import { BlurView } from "expo-blur"
import { Platform } from "react-native"

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen"
import CategoriesScreen from "../screens/categories/CategoriesScreen"
import CategoryFormScreen from "../screens/categories/CategoryFormScreen"
import ProductsScreen from "../screens/products/ProductsScreen"
import ProductFormScreen from "../screens/products/ProductFormScreen"
import BannersScreen from "../screens/banners/BannersScreen"
import BannerFormScreen from "../screens/banners/BannerFormScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()
const RootStack = createStackNavigator()

function CategoriesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} options={{ title: "Categories" }} />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={({ route }) => ({
          title: route.params?.category ? "Edit Category" : "Add Category",
        })}
      />
    </Stack.Navigator>
  )
}

function ProductsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ title: "Products" }} />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.product ? "Edit Product" : "Add Product",
        })}
      />
    </Stack.Navigator>
  )
}

function BannersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="BannersList" component={BannersScreen} options={{ title: "Banners" }} />
      <Stack.Screen
        name="BannerForm"
        component={BannerFormScreen}
        options={({ route }) => ({
          title: route.params?.banner ? "Edit Banner" : "Add Banner",
        })}
      />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline"
          } else if (route.name === "Categories") {
            iconName = focused ? "folder" : "folder-outline"
          } else if (route.name === "Products") {
            iconName = focused ? "package-variant" : "package-variant-closed"
          } else if (route.name === "Banners") {
            iconName = focused ? "image-multiple" : "image-multiple-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline"
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          position: "absolute",
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={100} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.8)" }} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Categories" component={CategoriesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Banners" component={BannersStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function MainNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      {/* Modal screens for dashboard quick actions */}
      <RootStack.Group screenOptions={{ presentation: "modal" }}>
        <RootStack.Screen
          name="DashboardCategoryForm"
          component={CategoryFormScreen}
          options={{
            headerShown: true,
            title: "Add Category",
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
          }}
        />
        <RootStack.Screen
          name="DashboardProductForm"
          component={ProductFormScreen}
          options={{
            headerShown: true,
            title: "Add Product",
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
          }}
        />
        <RootStack.Screen
          name="DashboardBannerForm"
          component={BannerFormScreen}
          options={{
            headerShown: true,
            title: "Add Banner",
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
          }}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  )
}
