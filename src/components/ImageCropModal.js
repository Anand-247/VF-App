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

  // Calculate distance between two touches
  const getDistance = (touches) => {
    const [touch1, touch2] = touches
    const dx = touch1.pageX - touch2.pageX
    const dy = touch1.pageY - touch2.pageY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Update crop box size when crop size changes
  useEffect(() => {
    if (visible && imageUri && imageSize.width > 0 && imageSize.height > 0) {
      const size = cropSizes[selectedSize]
      const baseSize = 150
      const aspectRatio = size.width / size.height
      
      let newWidth, newHeight
      if (aspectRatio > 1) {
        newWidth = baseSize
        newHeight = baseSize / aspectRatio
      } else {
        newWidth = baseSize * aspectRatio
        newHeight = baseSize
      }

      // Center the crop box
      const newX = Math.max(0, (imageSize.width - newWidth) / 2)
      const newY = Math.max(0, (imageSize.height - newHeight) / 2)

      setCropBox({ x: newX, y: newY, width: newWidth, height: newHeight })
      
      // Update animated values
      cropBoxPosition.setValue({ x: newX, y: newY })
      setScale(1)
      setLastScale(1)
      scaleValue.setValue(1)
    }
  }, [selectedSize, visible, imageSize])

  // Pan responder for dragging and pinch-to-zoom
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (evt.nativeEvent.touches.length === 1) {
        // Single touch - start dragging
        cropBoxPosition.setOffset({
          x: cropBoxPosition.x._value,
          y: cropBoxPosition.y._value,
        })
      } else if (evt.nativeEvent.touches.length === 2) {
        // Two touches - prepare for pinch
        setLastScale(scale)
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.touches.length === 1) {
        // Single touch - drag crop box
        const currentX = cropBoxPosition.x._offset + gestureState.dx
        const currentY = cropBoxPosition.y._offset + gestureState.dy
        
        const maxX = imageSize.width - cropBox.width * scale
        const maxY = imageSize.height - cropBox.height * scale
        
        const constrainedX = Math.max(0, Math.min(currentX, maxX))
        const constrainedY = Math.max(0, Math.min(currentY, maxY))
        
        cropBoxPosition.setValue({ x: constrainedX, y: constrainedY })
      } else if (evt.nativeEvent.touches.length === 2) {
        // Two touches - pinch to zoom
        const currentDistance = getDistance(evt.nativeEvent.touches)
        const initialDistance = getDistance(evt.nativeEvent.touches)
        
        if (initialDistance > 0) {
          const newScale = Math.max(0.5, Math.min(3, lastScale * (currentDistance / initialDistance)))
          setScale(newScale)
          scaleValue.setValue(newScale)
        }
      }
    },
    onPanResponderRelease: (evt) => {
      if (evt.nativeEvent.touches.length <= 1) {
        // End dragging
        cropBoxPosition.flattenOffset()
        
        // Update crop box state
        const newX = cropBoxPosition.x._value
        const newY = cropBoxPosition.y._value
        
        setCropBox(prev => ({
          ...prev,
          x: isNaN(newX) ? prev.x : newX,
          y: isNaN(newY) ? prev.y : newY,
          width: prev.width * scale,
          height: prev.height * scale
        }))
        
        setLastScale(scale)
      }
    },
  })

  // Manual zoom functions
  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3)
    setScale(newScale)
    setLastScale(newScale)
    
    Animated.timing(scaleValue, {
      toValue: newScale,
      duration: 200,
      useNativeDriver: false,
    }).start()
    
    // Update crop box size
    setCropBox(prev => ({
      ...prev,
      width: prev.width * (newScale / scale),
      height: prev.height * (newScale / scale)
    }))
  }

  const zoomOut = () => {
    const newScale = Math.max(scale * 0.8, 0.5)
    setScale(newScale)
    setLastScale(newScale)
    
    Animated.timing(scaleValue, {
      toValue: newScale,
      duration: 200,
      useNativeDriver: false,
    }).start()
    
    // Update crop box size
    setCropBox(prev => ({
      ...prev,
      width: prev.width * (newScale / scale),
      height: prev.height * (newScale / scale)
    }))
  }

  // Reset crop box to center
  const resetCropBox = () => {
    const size = cropSizes[selectedSize]
    const baseSize = 150
    const aspectRatio = size.width / size.height
    
    let newWidth, newHeight
    if (aspectRatio > 1) {
      newWidth = baseSize
      newHeight = baseSize / aspectRatio
    } else {
      newWidth = baseSize * aspectRatio
      newHeight = baseSize
    }

    const newX = (imageSize.width - newWidth) / 2
    const newY = (imageSize.height - newHeight) / 2
    const newScale = 1

    setCropBox({ x: newX, y: newY, width: newWidth, height: newHeight })
    setScale(newScale)
    setLastScale(newScale)
    
    Animated.parallel([
      Animated.timing(cropBoxPosition, {
        toValue: { x: newX, y: newY },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(scaleValue, {
        toValue: newScale,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start()
  }

  const handleCrop = async () => {
    try {
      setCropping(true)
      
      // Calculate actual crop parameters
      const actualScale = scale || 1
      const actualWidth = (cropBox.width * actualScale) || 100
      const actualHeight = (cropBox.height * actualScale) || 100
      const actualX = cropBox.x || 0
      const actualY = cropBox.y || 0
      
      const cropParams = {
        x: actualX,
        y: actualY,
        width: actualWidth,
        height: actualHeight,
        imageWidth: imageSize.width,
        imageHeight: imageSize.height
      }
      
      const croppedImage = await cropImage(imageUri, cropParams)
      onCropComplete(croppedImage)
      onDismiss()
    } catch (error) {
      console.error("Crop error:", error)
      Alert.alert("Error", "Failed to crop image")
    } finally {
      setCropping(false)
    }
  }

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent
    const containerWidth = screenWidth * 0.8
    const containerHeight = screenHeight * 0.4
    
    // Calculate scaled dimensions to fit container
    const imageAspectRatio = width / height
    const containerAspectRatio = containerWidth / containerHeight
    
    let displayWidth, displayHeight
    if (imageAspectRatio > containerAspectRatio) {
      displayWidth = containerWidth
      displayHeight = containerWidth / imageAspectRatio
    } else {
      displayHeight = containerHeight
      displayWidth = containerHeight * imageAspectRatio
    }
    
    setImageSize({ width: displayWidth, height: displayHeight })
  }

  const previewSize = screenWidth * 0.8

  // Safe values for display
  const safeX = isNaN(cropBox.x) ? 0 : cropBox.x
  const safeY = isNaN(cropBox.y) ? 0 : cropBox.y
  const safeWidth = isNaN(cropBox.width) ? 100 : cropBox.width
  const safeHeight = isNaN(cropBox.height) ? 100 : cropBox.height
  const safeScale = isNaN(scale) ? 1 : scale

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Card style={styles.card}>
          <Card.Title 
            title="Crop Image" 
            titleStyle={styles.title}
            right={(props) => (
              <IconButton
                {...props}
                icon={() => <AntDesign name="close" size={24} color={theme.colors.onSurface} />}
                onPress={onDismiss}
              />
            )}
          />
          
          <Card.Content>
            {/* Image Preview with Crop Box */}
            <View style={styles.imageContainer}>
              {imageUri && (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={[
                      styles.image, 
                      { 
                        width: imageSize.width, 
                        height: imageSize.height 
                      }
                    ]}
                    resizeMode="contain"
                    onLoad={handleImageLoad}
                  />
                  
                  {/* Crop Box Overlay */}
                  <View style={styles.cropOverlay} {...panResponder.panHandlers}>
                    {/* Dark overlay areas */}
                    <View style={[styles.overlay, { height: safeY }]} />
                    <View style={[styles.overlay, { 
                      top: safeY + (safeHeight * safeScale), 
                      height: Math.max(0, imageSize.height - safeY - (safeHeight * safeScale))
                    }]} />
                    <View style={[styles.overlay, { 
                      top: safeY, 
                      width: safeX, 
                      height: safeHeight * safeScale
                    }]} />
                    <View style={[styles.overlay, { 
                      top: safeY, 
                      left: safeX + (safeWidth * safeScale), 
                      width: Math.max(0, imageSize.width - safeX - (safeWidth * safeScale)), 
                      height: safeHeight * safeScale
                    }]} />
                    
                    {/* Animated Crop Box */}
                    <Animated.View
                      style={[
                        styles.cropBox,
                        {
                          left: cropBoxPosition.x,
                          top: cropBoxPosition.y,
                          width: safeWidth,
                          height: safeHeight,
                          transform: [{ scale: scaleValue }]
                        }
                      ]}
                    >
                      {/* Corner handles */}
                      <View style={[styles.handle, styles.topLeft]} />
                      <View style={[styles.handle, styles.topRight]} />
                      <View style={[styles.handle, styles.bottomLeft]} />
                      <View style={[styles.handle, styles.bottomRight]} />
                      
                      {/* Center move icon */}
                      <View style={styles.centerHandle}>
                        <MaterialIcons name="drag-indicator" size={20} color="white" />
                      </View>
                      
                      {/* Grid lines */}
                      <View style={styles.gridLine1} />
                      <View style={styles.gridLine2} />
                      <View style={styles.gridLine3} />
                      <View style={styles.gridLine4} />
                    </Animated.View>
                  </View>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>
                • Drag crop box to move • Pinch with two fingers to zoom • Use buttons for precise control
              </Text>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
                <Text style={styles.controlButtonText}>Zoom Out</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={resetCropBox}>
                <MaterialIcons name="center-focus-strong" size={20} color={theme.colors.primary} />
                <Text style={styles.controlButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={styles.controlButtonText}>Zoom In</Text>
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            {/* Crop Size Selection */}
            <Text style={styles.sectionTitle}>Select Crop Size:</Text>
            <ScrollView style={styles.optionsContainer} horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(cropSizes).map(([key, size]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sizeOption,
                    selectedSize === key && styles.selectedSizeOption
                  ]}
                  onPress={() => setSelectedSize(key)}
                >
                  <View style={styles.sizeOptionContent}>
                    <RadioButton
                      value={key}
                      status={selectedSize === key ? "checked" : "unchecked"}
                      onPress={() => setSelectedSize(key)}
                      color={theme.colors.primary}
                    />
                    <View style={styles.sizeOptionText}>
                      <Text style={styles.sizeOptionLabel}>{size.label}</Text>
                      <Text style={styles.sizeOptionDimensions}>
                        {size.width} × {size.height}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Crop Info */}
            <View style={styles.cropInfo}>
              <Text style={styles.cropInfoText}>
                Size: {Math.round(safeWidth * safeScale)} × {Math.round(safeHeight * safeScale)}px
              </Text>
              <Text style={styles.cropInfoText}>
                Position: ({Math.round(safeX)}, {Math.round(safeY)}) • Scale: {safeScale.toFixed(1)}x
              </Text>
            </View>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button 
              mode="outlined" 
              onPress={onDismiss} 
              disabled={cropping} 
              style={styles.button}
              icon={() => <AntDesign name="close" size={16} color={theme.colors.onSurface} />}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCrop} 
              loading={cropping} 
              disabled={cropping} 
              style={styles.button}
              icon={() => <Ionicons name="checkmark" size={16} color="white" />}
            >
              {cropping ? "Cropping..." : "Crop Image"}
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing.md,
    maxHeight: "95%",
  },
  card: {
    backgroundColor: theme.colors.surface,
    ...shadows.medium,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: theme.roundness,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceVariant,
  },
  image: {
    borderRadius: theme.roundness,
  },
  cropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    left: 0,
    right: 0,
  },
  cropBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  handle: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  topLeft: {
    top: -6,
    left: -6,
  },
  topRight: {
    top: -6,
    right: -6,
  },
  bottomLeft: {
    bottom: -6,
    left: -6,
  },
  bottomRight: {
    bottom: -6,
    right: -6,
  },
  centerHandle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  gridLine1: {
    position: "absolute",
    top: "33.33%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  gridLine2: {
    position: "absolute",
    top: "66.66%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  gridLine3: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33.33%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  gridLine4: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "66.66%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  instructionsContainer: {
    backgroundColor: theme.colors.primaryContainer,
    padding: spacing.sm,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 12,
    color: theme.colors.onPrimaryContainer,
    textAlign: "center",
    lineHeight: 16,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  controlButton: {
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surfaceVariant,
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: "500",
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    maxHeight: 100,
    marginBottom: spacing.md,
  },
  sizeOption: {
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surfaceVariant,
    minWidth: 120,
  },
  selectedSizeOption: {
    backgroundColor: theme.colors.primaryContainer,
  },
  sizeOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sizeOptionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sizeOptionLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: "500",
  },
  sizeOptionDimensions: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  cropInfo: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.sm,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
  },
  cropInfoText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 2,
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  button: {
    minWidth: 100,
  },
})