import { TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
export function IconButton({ text, iconID, color, ...buttonProps }) {
    return (<TouchableOpacity {...buttonProps}>
      <Icon text={text} iconID={iconID} color={color}/>
    </TouchableOpacity>);
}
//# sourceMappingURL=IconButton.js.map