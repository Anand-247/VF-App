import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { theme } from "../theme/theme"

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen"
import CategoriesScreen from "../screens/categories/CategoriesScreen"
import CategoryFormScreen from "../screens/categories/CategoryFormScreen"
import ProductsScreen from "../screens/products/ProductsScreen"
import ProductFormScreen from "../screens/products/ProductFormScreen"
import BannersScreen from "../screens/banners/BannersScreen"
import BannerFormScreen from "../screens/banners/BannerFormScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import { TouchableOpacity } from "react-native"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function CategoriesStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} options={{ headerShown: false, title: "Categories" }} />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={({ route }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginHorizontal: 16}}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          ),
          title: route.params?.category ? "Edit Category" : "Add Category",
          presentation: "modal",
        })}
      />
    </Stack.Navigator>
  )
}

function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ headerShown: false, title: "Products" }} />
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
    <Stack.Navigator>
      <Stack.Screen name="BannersList" component={BannersScreen} options={{ headerShown: false, title: "Banners" }} />
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

export default function MainNavigator() {
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
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Banners" component={BannersStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
