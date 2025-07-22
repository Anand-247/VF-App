import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"
import { uploadAPI } from "./api"

export const cropSizes = {
  square: { width: 800, height: 800, label: "Square (1:1)" },
  portrait: { width: 600, height: 800, label: "Portrait (3:4)" },
  landscape: { width: 800, height: 600, label: "Landscape (4:3)" },
  banner: { width: 1200, height: 400, label: "Banner (3:1)" },
}

export const requestPermissions = async () => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
  const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

  return {
    camera: cameraStatus === "granted",
    library: libraryStatus === "granted",
  }
}

export const pickImage = async (source = "library") => {
  try {
    const permissions = await requestPermissions()

    if (source === "camera" && !permissions.camera) {
      throw new Error("Camera permission not granted")
    }

    if (source === "library" && !permissions.library) {
      throw new Error("Photo library permission not granted")
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: false,
    }

    let result
    if (source === "camera") {
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    if (!result.canceled && result.assets[0]) {
      return result.assets[0]
    }

    return null
  } catch (error) {
    console.error("Error picking image:", error)
    throw error
  }
}

export const cropImage = async (imageUri, cropSize) => {
  try {
    const imageInfo = await ImageManipulator.getInfoAsync(imageUri)
    const originalWidth = imageInfo.width
    const originalHeight = imageInfo.height

    const targetRatio = cropSize.width / cropSize.height

    let cropWidth = originalWidth
    let cropHeight = cropWidth / targetRatio

    if (cropHeight > originalHeight) {
      cropHeight = originalHeight
      cropWidth = cropHeight * targetRatio
    }

    const originX = (originalWidth - cropWidth) / 2
    const originY = (originalHeight - cropHeight) / 2

    const croppedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX,
            originY,
            width: cropWidth,
            height: cropHeight,
          },
        },
        {
          resize: {
            width: cropSize.width,
            height: cropSize.height,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    )

    return croppedImage
  } catch (error) {
    console.error("Error cropping image:", error)
    throw error
  }
}


export const uploadImage = async (imageUri, folder = "general") => {
  try {
    const formData = new FormData()

    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: `image_${Date.now()}.jpg`,
    })

    formData.append("folder", folder)

    const response = await uploadAPI.uploadImage(formData)
    return response
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
