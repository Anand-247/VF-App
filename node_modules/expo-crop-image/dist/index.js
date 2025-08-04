import * as ImageManipulator from 'expo-image-manipulator';
import { useCallback, useEffect } from 'react';
import { Modal, StatusBar, StyleSheet, View } from 'react-native';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { EditorContext } from './context/editor';
import { ControlBar } from './ControlBar';
import { EditingWindow } from './EditingWindow';
import { Processing } from './Processing';
import { editingModeState, editorOptionsState, imageDataState, isEditState, processingState, readyState, } from './Store';
function ImageEditorCore(props) {
    const { minimumCropDimensions = { width: 100, height: 100 }, fixedAspectRatio = 0.66666666666, onEditingCancel, onEditingComplete, imageUri = null, processingComponent, editorOptions, } = props;
    const [options, setOptions] = useRecoilState(editorOptionsState);
    const [imageData, setImageData] = useRecoilState(imageDataState);
    const [, setReady] = useRecoilState(readyState);
    const [, setEditingMode] = useRecoilState(editingModeState);
    const [, setProcessing] = useRecoilState(processingState);
    const [isEdit] = useRecoilState(isEditState);
    const initialize = useCallback(async () => {
        setProcessing(true);
        if (imageUri) {
            const { width: pickerWidth, height: pickerHeight } = await ImageManipulator.manipulateAsync(imageUri, []);
            setImageData({
                uri: imageUri,
                width: pickerWidth,
                height: pickerHeight,
            });
            setReady(true);
            setProcessing(false);
        }
    }, []);
    const onBackPress = () => {
        if (!isEdit) {
            onEditingCancel();
        }
        else {
            setProcessing(true);
            initialize().then(() => {
                setEditingMode('crop');
                setProcessing(false);
            });
        }
    };
    const onSave = () => {
        onEditingComplete(imageData);
    };
    useEffect(() => {
        initialize().then(setCustomStyles).catch(console.error);
    }, [imageUri]);
    function setCustomStyles() {
        if (editorOptions) {
            const custom = Object.assign({}, options);
            Object.entries(editorOptions).forEach(([key, value]) => {
                if (key) {
                    if (typeof custom[key] === 'object' && custom[key] !== null) {
                        custom[key] = { ...custom[key], ...value };
                    }
                    else {
                        custom[key] = value;
                    }
                }
            });
            setOptions(custom);
        }
    }
    return (<EditorContext.Provider value={{
            minimumCropDimensions,
            fixedAspectRatio,
            onBackPress,
            onSave,
            imageUri,
        }}>
      <StatusBar hidden={true}/>
      <ImageEditorView processingComponent={processingComponent}/>
    </EditorContext.Provider>);
}
export function ImageEditorView({ processingComponent }) {
    const [ready] = useRecoilState(readyState);
    const [processing] = useRecoilState(processingState);
    const { backgroundColor, controlBar } = useRecoilValue(editorOptionsState);
    return (<>
      {ready && (<View style={[styles.container, { backgroundColor }]}>
          {(controlBar === null || controlBar === void 0 ? void 0 : controlBar.position) === 'top' && <ControlBar />}
          <EditingWindow />
          {(controlBar === null || controlBar === void 0 ? void 0 : controlBar.position) === 'bottom' && <ControlBar />}
        </View>)}

      {processing && <Processing customComponent={processingComponent}/>}
    </>);
}
export function ImageEditor({ isVisible, ...props }) {
    return (<Modal visible={isVisible} style={styles.modalContainer}>
      <RecoilRoot>
        <ImageEditorCore {...props}/>
      </RecoilRoot>
    </Modal>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        zIndex: 1,
    },
});
//# sourceMappingURL=index.js.map