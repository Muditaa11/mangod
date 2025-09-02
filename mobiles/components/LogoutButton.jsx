import { Text, TouchableOpacity, Alert } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../constants/colors'
import styles from '../assets/styles/profile.styles'

export default function LogoutButton() {
    const {logout} = useAuthStore();

    const confirmLogout = () => {
        Alert.alert("Logout", "are you sure you wanted to logout", [
            {text: "Cancel", style: "cancel"},
            {text: "Logout", onPress: () => logout(), style: "destructive"},

        ])
    }
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
        <Text style = {styles.logoutText}> Logout </Text>
    </TouchableOpacity>
  )
}