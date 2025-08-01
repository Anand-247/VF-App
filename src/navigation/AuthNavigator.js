import { createStackNavigator } from "@react-navigation/stack"
import LoginScreen from "../screens/auth/LoginScreen"

const Stack = createStackNavigator()

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
