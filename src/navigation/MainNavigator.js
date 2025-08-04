import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { theme } from "../theme/theme"
import { TouchableOpacity } from "react-native"

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen"
import CategoriesScreen from "../screens/categories/CategoriesScreen"
import CategoryFormScreen from "../screens/categories/CategoryFormScreen"
import ProductsScreen from "../screens/products/ProductsScreen"
import ProductFormScreen from "../screens/products/ProductFormScreen"
import BannersScreen from "../screens/banners/BannersScreen"
import BannerFormScreen from "../screens/banners/BannerFormScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import QueriesScreen from "../screens/query/QueriesScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function CategoriesStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CategoriesList" 
        component={CategoriesScreen} 
        options={{ headerShown: false, title: "Categories" }} 
      />
      <Stack.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={({ route }) => ({
          title: route.params?.category ? "Edit Category" : "Add Category",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => route.params?.onGoBack ? route.params.onGoBack() : navigation.goBack()} 
              style={{ marginHorizontal: 16}}
            >
              <MaterialCommunityIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  )
}

function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProductsList" 
        component={ProductsScreen} 
        options={{ headerShown: false, title: "Products" }} 
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.product ? "Edit Product" : "Add Product",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => route.params?.onGoBack ? route.params.onGoBack() : navigation.goBack()} 
              style={{ marginHorizontal: 16}}
            >
              <MaterialCommunityIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  )
}

function BannersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BannersList" 
        component={BannersScreen} 
        options={{ headerShown: false, title: "Banners" }} 
      />
      <Stack.Screen
        name="BannerForm"
        component={BannerFormScreen}
        options={({ route }) => ({
          title: route.params?.banner ? "Edit Banner" : "Add Banner",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => route.params?.onGoBack ? route.params.onGoBack() : navigation.goBack()} 
              style={{ marginHorizontal: 16}}
            >
              <MaterialCommunityIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  )
}

function QueriesListScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Queries" 
        component={QueriesScreen} 
        options={{ headerShown: false, title: "Queries" }}
      />
    </Stack.Navigator>
  )
}

// Main Tab Navigator
function TabNavigator() {
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
          } else if (route.name === "Queries") {
            iconName = focused ? "comment-question" : "comment-question-outline"
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
          height: 70,
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} 
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate("ProfileModal")}
              style={{ marginHorizontal: 16 }}
            >
              <MaterialCommunityIcons name="account" size={30} color="white" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Banners" component={BannersStack} />
      <Tab.Screen name="Queries" component={QueriesListScreen} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  )
}

// Root Stack Navigator with Modal
export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TabNavigator" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      {/* Global Modal Screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="ProductFormModal"
          component={ProductFormScreen}
          options={({ route, navigation }) => ({
            title: route.params?.product ? "Edit Product" : "Add Product",
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ marginHorizontal: 16}}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="CategoryFormModal"
          component={CategoryFormScreen}
          options={({ route, navigation }) => ({
            title: route.params?.category ? "Edit Category" : "Add Category",
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ marginHorizontal: 16}}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="BannerFormModal"
          component={BannerFormScreen}
          options={({ route, navigation }) => ({
            title: route.params?.banner ? "Edit Banner" : "Add Banner",
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ marginHorizontal: 16}}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ProfileModal"
          component={ProfileScreen}
          options={({ navigation }) => ({
            title: "Profile",
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ marginHorizontal: 16 }}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}