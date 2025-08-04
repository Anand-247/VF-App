import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconButton } from './components/IconButton';
import { EditorContext } from './context/editor';
import { usePerformCrop } from './customHooks/usePerformCrop';
import { editorOptionsState, isEditState } from './Store';
function ControlBar() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const [isEdit, setIsEdit] = useRecoilState(isEditState);
    const { controlBar } = useRecoilValue(editorOptionsState);
    const { onBackPress, onSave } = useContext(EditorContext);
    const performCrop = usePerformCrop();
    const onEditDone = async () => {
        await performCrop();
        setIsEdit(true);
    };
    return (<View style={[
            styles.container,
            {
                backgroundColor: controlBar === null || controlBar === void 0 ? void 0 : controlBar.backgroundColor,
                height: controlBar === null || controlBar === void 0 ? void 0 : controlBar.height,
            },
        ]}>
      <IconButton iconID={!isEdit
            ? (_a = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cancelButton) === null || _a === void 0 ? void 0 : _a.iconName
            : (_b = controlBar === null || controlBar === void 0 ? void 0 : controlBar.backButton) === null || _b === void 0 ? void 0 : _b.iconName} color={!isEdit
            ? (_c = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cancelButton) === null || _c === void 0 ? void 0 : _c.color
            : (_d = controlBar === null || controlBar === void 0 ? void 0 : controlBar.backButton) === null || _d === void 0 ? void 0 : _d.color} text={!isEdit
            ? (_e = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cancelButton) === null || _e === void 0 ? void 0 : _e.text
            : (_f = controlBar === null || controlBar === void 0 ? void 0 : controlBar.backButton) === null || _f === void 0 ? void 0 : _f.text} onPress={() => {
            onBackPress();
            setIsEdit(false);
        }}/>
      {!isEdit ? (<IconButton iconID={(_g = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cropButton) === null || _g === void 0 ? void 0 : _g.iconName} text={(_h = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cropButton) === null || _h === void 0 ? void 0 : _h.text} color={(_j = controlBar === null || controlBar === void 0 ? void 0 : controlBar.cropButton) === null || _j === void 0 ? void 0 : _j.color} onPress={onEditDone}/>) : (<IconButton iconID={(_k = controlBar === null || controlBar === void 0 ? void 0 : controlBar.saveButton) === null || _k === void 0 ? void 0 : _k.iconName} text={(_l = controlBar === null || controlBar === void 0 ? void 0 : controlBar.saveButton) === null || _l === void 0 ? void 0 : _l.text} color={(_m = controlBar === null || controlBar === void 0 ? void 0 : controlBar.saveButton) === null || _m === void 0 ? void 0 : _m.color} onPress={onSave}/>)}
    </View>);
}
export { ControlBar };
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
});
//# sourceMappingURL=ControlBar.js.map