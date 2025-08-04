import { View, StyleSheet, ActivityIndicator } from 'react-native';
function Processing({ color = '#FFF', size = 'large', customComponent, }) {
    return (<View style={styles.container}>
      {customComponent !== null && customComponent !== void 0 ? customComponent : <ActivityIndicator color={color} size={size}/>}
    </View>);
}
export { Processing };
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: '#33333355',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
//# sourceMappingURL=Processing.js.map