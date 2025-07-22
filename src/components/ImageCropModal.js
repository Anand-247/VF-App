import React, { useState, useRef, useEffect } from "react"
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Alert
} from "react-native"
import { Modal, Portal, Button, Text, Card, RadioButton, Divider, IconButton } from "react-native-paper"
import { Image } from "react-native"
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons"
import { theme, spacing, shadows } from "../theme/theme"
import { cropSizes, cropImage } from "../services/imageService"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function ImageCropModal({ visible, onDismiss, imageUri, onCropComplete }) {
  const [selectedSize, setSelectedSize] = useState("square")
  const [cropping, setCropping] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 300, height: 300 })
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: 200, height: 200 })
  const [scale, setScale] = useState(1)
  const [lastScale, setLastScale] = useState(1)

  const cropBoxPosition = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current
  const scaleValue = useRef(new Animated.Value(1)).current
  const initialPinchDistance = useRef(0)

  // Track animated position into state
  useEffect(() => {
    const id = cropBoxPosition.addListener(({ x, y }) => {
      setCropBox(prev => ({ ...prev, x, y }))
    })
    return () => cropBoxPosition.removeListener(id)
  }, [])

  // Calculate distance between two touches
  const getDistance = touches => {
    const [t1, t2] = touches
    const dx = t1.pageX - t2.pageX
    const dy = t1.pageY - t2.pageY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Initialize crop box on changes
  useEffect(() => {
    if (visible && imageUri && imageSize.width > 0) {
      const size = cropSizes[selectedSize]
      const baseSize = 150
      const ratio = size.width / size.height
      let newW, newH
      if (ratio > 1) { newW = baseSize; newH = baseSize / ratio }
      else { newW = baseSize * ratio; newH = baseSize }

      const newX = Math.max(0, (imageSize.width - newW) / 2)
      const newY = Math.max(0, (imageSize.height - newH) / 2)

      setCropBox({ x: newX, y: newY, width: newW, height: newH })
      cropBoxPosition.setOffset({ x: newX, y: newY })
      cropBoxPosition.setValue({ x: 0, y: 0 })
      setScale(1)
      setLastScale(1)
      scaleValue.setValue(1)
    }
  }, [selectedSize, visible, imageSize])

  // PanResponder
  const panResponder = PanResponder.create({
  onPanResponderGrant: () => {
    translateX.setOffset(currentPosition.current.x)
    translateY.setOffset(currentPosition.current.y)
    translateX.setValue(0)
    translateY.setValue(0)
  },
  onPanResponderMove: (evt, gesture) => {
    const { dx, dy } = gesture
    const newX = currentPosition.current.x + dx
    const newY = currentPosition.current.y + dy
    const constrained = constrainPosition(newX, newY)
    
    const offsetX = constrained.x - currentPosition.current.x
    const offsetY = constrained.y - currentPosition.current.y
    
    translateX.setValue(offsetX)
    translateY.setValue(offsetY)
  }
})

  // Zoom controls
  const zoomIn = () => {
    const ns = Math.min(scale * 1.2, 3)
    setScale(ns); setLastScale(ns)
    Animated.timing(scaleValue, { toValue: ns, duration: 200, useNativeDriver: false }).start()
    setCropBox(prev => ({ ...prev, width: prev.width * (ns/scale), height: prev.height * (ns/scale) }))
  }
  const zoomOut = () => {
    const ns = Math.max(scale * 0.8, 0.5)
    setScale(ns); setLastScale(ns)
    Animated.timing(scaleValue, { toValue: ns, duration: 200, useNativeDriver: false }).start()
    setCropBox(prev => ({ ...prev, width: prev.width * (ns/scale), height: prev.height * (ns/scale) }))
  }
  const resetCropBox = () => {
    const size = cropSizes[selectedSize]; const base=150; const r=size.width/size.height
    let nw, nh; if(r>1){nw=base; nh=base/r}else{nw=base*r; nh=base}
    const nx=(imageSize.width-nw)/2, ny=(imageSize.height-nh)/2
    setCropBox({ x:nx,y:ny,width:nw,height:nh }); setScale(1); setLastScale(1)
    Animated.parallel([
      Animated.timing(cropBoxPosition, { toValue:{x:nx,y:ny}, duration:300, useNativeDriver:false }),
      Animated.timing(scaleValue, { toValue:1, duration:300, useNativeDriver:false })
    ]).start()
  }

  const handleCrop = async () => {
    try {
      setCropping(true)
      const ax = cropBox.x || 0, ay = cropBox.y || 0
      const aw = cropBox.width * scale || 100, ah = cropBox.height * scale || 100
      const result = await cropImage(imageUri, { x:ax,y:ay,width:aw,height:ah })
      onCropComplete(result)
      onDismiss()
    } catch (e) {
      Alert.alert("Error", "Failed to crop image")
    } finally { setCropping(false) }
  }

  const handleImageLoad = ({ nativeEvent }) => {
    const { width, height } = nativeEvent
    const cW = screenWidth * 0.8, cH = screenHeight * 0.4
    const ar = width/height, car = cW/cH
    let dW,dH
    if(ar>car){dW=cW; dH=cW/ar} else {dH=cH; dW=cH*ar}
    setImageSize({ width:dW, height:dH })
  }

  const safe = val => isNaN(val)?0:val
  const sx = safe(cropBox.x), sy = safe(cropBox.y)
  const sw = safe(cropBox.width), sh = safe(cropBox.height)
  const ss = isNaN(scale)?1:scale

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card style={styles.card}>
          <Card.Title
            title="Crop Image"
            titleStyle={styles.title}
            right={p => <IconButton {...p} icon={() => <AntDesign name="close" size={24} color={theme.colors.onSurface}/>} onPress={onDismiss}/>}            
          />
          <Card.Content>
            <View style={styles.imageContainer}>
              {imageUri && (
                <View style={styles.imageWrapper} {...panResponder.panHandlers}>
                  <Image
                    source={{uri:imageUri}}
                    style={[styles.image,{width:300,height:imageSize.height}]}
                    resizeMode="contain"
                    onLoad={handleImageLoad}
                  />
                  <Animated.View
                    style={[styles.cropBox,{left:cropBoxPosition.x,top:cropBoxPosition.y,width:sw,height:sh,transform:[{scale:scaleValue}]}]}
                  >
                    <View style={[styles.handle,styles.topLeft]}/>
                    <View style={[styles.handle,styles.topRight]}/>
                    <View style={[styles.handle,styles.bottomLeft]}/>
                    <View style={[styles.handle,styles.bottomRight]}/>
                    <View style={styles.centerHandle}>
                      <MaterialIcons name="drag-indicator" size={20} color="white"/>
                    </View>
                  </Animated.View>
                </View>
              )}
            </View>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>• Drag to move • Pinch to zoom • Use buttons below</Text>
            </View>
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={zoomOut}><Ionicons name="remove" size={20} color={theme.colors.primary}/><Text style={styles.controlButtonText}>Zoom Out</Text></TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={resetCropBox}><MaterialIcons name="center-focus-strong" size={20} color={theme.colors.primary}/><Text style={styles.controlButtonText}>Reset</Text></TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={zoomIn}><Ionicons name="add" size={20} color={theme.colors.primary}/><Text style={styles.controlButtonText}>Zoom In</Text></TouchableOpacity>
            </View>
            <Divider style={styles.divider}/>            
            <Text style={styles.sectionTitle}>Select Crop Size:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
              {Object.entries(cropSizes).map(([k,s])=> (
                <TouchableOpacity key={k} style={[styles.sizeOption, selectedSize===k&& styles.selectedSizeOption]} onPress={()=>setSelectedSize(k)}>
                  <View style={styles.sizeOptionContent}>
                    <RadioButton status={selectedSize===k?"checked":"unchecked"} onPress={()=>setSelectedSize(k)} color={theme.colors.primary}/>
                    <View style={styles.sizeOptionText}>
                      <Text style={styles.sizeOptionLabel}>{s.label}</Text>
                      <Text style={styles.sizeOptionDimensions}>{s.width} × {s.height}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.cropInfo}>
              <Text style={styles.cropInfoText}>Pos: ({Math.round(sx)}, {Math.round(sy)}) • Size: ({Math.round(sw)}, {Math.round(sh)}) • Scale: {ss.toFixed(1)}x</Text>
            </View>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button mode="outlined" onPress={onDismiss} disabled={cropping} style={styles.button} icon={() => <AntDesign name="close" size={16} color={theme.colors.onSurface}/>}>Cancel</Button>
            <Button mode="contained" onPress={handleCrop} loading={cropping} disabled={cropping} style={styles.button} icon={() => <Ionicons name="checkmark" size={16} color="white"/>}>{cropping?"Cropping...":"Crop Image"}</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal:{ margin:spacing.md, maxHeight:"95%" }, card:{ backgroundColor:theme.colors.surface, ...shadows.medium },
  title:{ color:theme.colors.primary, fontWeight:"bold", fontSize:20 },
  imageContainer:{ alignItems:"center", marginBottom:spacing.md }, imageWrapper:{ position:"relative", overflow:"hidden", backgroundColor:theme.colors.surfaceVariant }, image:{ borderRadius:theme.roundness },
  cropBox:{ position:"absolute", borderWidth:2, borderColor:theme.colors.primary, backgroundColor:"rgba(33,150,243,0.1)" },
  handle:{ position:"absolute", width:12,height:12, backgroundColor:theme.colors.primary, borderRadius:6, borderWidth:2,borderColor:"white" }, topLeft:{ top:-6,left:-6 }, topRight:{ top:-6,right:-6 }, bottomLeft:{ bottom:-6,left:-6 }, bottomRight:{ bottom:-6,right:-6 },
  centerHandle:{ position:"absolute", top:"50%", left:"50%", transform:[{translateX:-15},{translateY:-15}], width:30,height:30, backgroundColor:theme.colors.primary, borderRadius:15, justifyContent:"center",alignItems:"center",opacity:0.9 },
  instructionsContainer:{ backgroundColor:theme.colors.primaryContainer,padding:spacing.sm,borderRadius:theme.roundness, marginBottom:spacing.md }, instructionText:{ fontSize:12, color:theme.colors.onPrimaryContainer, textAlign:"center", lineHeight:16 },
  controlsContainer:{ flexDirection:"row", justifyContent:"space-around", marginBottom:spacing.md }, controlButton:{ alignItems:"center", padding:spacing.sm, borderRadius:theme.roundness, backgroundColor:theme.colors.surfaceVariant, minWidth:80 }, controlButtonText:{ fontSize:12,color:theme.colors.primary,marginTop:4,fontWeight:"500" },
  divider:{ marginVertical:spacing.md }, sectionTitle:{ fontSize:16,fontWeight:"600",color:theme.colors.onSurface,marginBottom:spacing.sm }, optionsContainer:{ paddingVertical:spacing.sm }, sizeOption:{ marginRight:spacing.md,padding:spacing.sm, borderRadius:theme.roundness, backgroundColor:theme.colors.surfaceVariant, minWidth:120 }, selectedSizeOption:{ backgroundColor:theme.colors.primaryContainer }, sizeOptionContent:{ flexDirection:"row",alignItems:"center" }, sizeOptionText:{ marginLeft:spacing.sm, flex:1 }, sizeOptionLabel:{ fontSize:14,color:theme.colors.onSurface,fontWeight:"500" }, sizeOptionDimensions:{ fontSize:12,color:theme.colors.onSurfaceVariant },
  cropInfo:{ backgroundColor:theme.colors.surfaceVariant,padding:spacing.sm,borderRadius:theme.roundness,marginBottom:spacing.md }, cropInfoText:{ fontSize:12, color:theme.colors.onSurfaceVariant, textAlign:"center" },
  actions:{ justifyContent:"space-between", paddingHorizontal:spacing.md }, button:{ minWidth:100 }
})
