import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
export function Icon({ text, iconID, color }) {
    return (<View style={styles.container}>
      {iconID === 'x' ? (<Feather name={iconID} size={26} color={color}/>) : (<MaterialIcons name={iconID} size={26} color={color}/>)}
      <Text style={styles.text}>{text}</Text>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        height: 64,
        width: 80,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    text: {
        color: '#fff',
        textAlign: 'center',
    },
});
//# sourceMappingURL=Icon.js.map