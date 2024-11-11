// stores/camera.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCameraStore = defineStore('camera', () => {
  const cameraAddress = ref('')
  const isFormDisabled = ref(false)

  const setCameraAddress = (address: string) => {
    cameraAddress.value = address
  }

  const toggleFormDisabled = (status: boolean) => {
    isFormDisabled.value = status
  }

  return {
    cameraAddress,
    isFormDisabled,
    setCameraAddress,
    toggleFormDisabled,
  }
})
