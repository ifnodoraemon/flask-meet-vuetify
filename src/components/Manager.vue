<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="camera-card">
          <v-card-title>摄像头地址</v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="handleSubmit">
              <v-row align="center">
                <v-col cols="10">
                  <v-text-field v-model="cameraAddress" label="rtsp地址" dense class="m-0" :rules="[rtspValidationRule]" :disabled="isFormDisabled"></v-text-field>
                </v-col>
                <v-col cols="2" class="d-flex align-center justify-center">
                  <v-btn :loading="loading" class="start-btn" type="submit" :disabled="isFormDisabled">
                    开始
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-center">
        <v-btn @click="checkStatus" :color="checkButtonColor" class="status-btn" :disabled="isCheckButtonDisabled">
          {{ checkButtonText }}
        </v-btn>
      </v-col>

      <v-col cols="12" class="d-flex justify-center">
        <v-alert v-if="statusMessage" :type="statusType" dismissible class="status-alert">
          {{ statusMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col v-for="user in userStore.userData" :key="user.id" cols="3">
        <v-card class="user-card" outlined>
          <v-img :src="'data:image/jpeg;base64,' + user.img_face" alt="Profile Image" class="profile-img"></v-img>
          <v-card-text class="text-center user-name">{{ user.name }}</v-card-text>
          <v-card-actions class="delete-action">
            <v-btn color="error" small @click="deleteFace(user.id, user.name)">删除</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="3">
        <v-card outlined class="upload-card" @click="triggerUpload">
          <v-icon color="primary" large>mdi-plus</v-icon>
        </v-card>
        <v-file-input ref="fileInput" accept="image/*" style="display: none;" @change="handleFileUpload"></v-file-input>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCameraStore } from '@/stores/camera'
import api from '@/services/api'

const userStore = useUserStore()
const fileInput = ref(null)
const loading = ref(false)
const form = ref(null)
const statusMessage = ref('')
const statusType = ref('')
const checkButtonColor = ref('primary')
const isCheckButtonDisabled = ref(false)
const checkButtonText = ref('检查人脸识别状态')
const isRunning = ref(false)

const cameraStore = useCameraStore()
const cameraAddress = ref(cameraStore.cameraAddress)
const isFormDisabled = ref(cameraStore.isFormDisabled)

const deleteFace = async (userId: number, name: string) => {
  try {
    await userStore.deleteFace(name)
    await fetchUserData()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

const fetchUserData = async () => {
  try {
    await userStore.fetchUserData()
  } catch (error) {
    console.error('获取用户数据失败:', error)
  }
}

onMounted(() => {
  fetchUserData()
})

const rtspValidationRule = (value: string) => true

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Image = reader.result as string
      const imageName = files[0].name
      uploadImage(base64Image, imageName)
    }
    reader.readAsDataURL(files[0])
  }
}

const uploadImage = async (base64Image: string, imageName: string) => {
  try {
    const response = await api.post('/addface', { image: base64Image, name: imageName })
    await fetchUserData()
  } catch (error) {
    statusMessage.value = '上传失败，请稍后再试'
    statusType.value = 'error'
  }
}

const handleSubmit = async () => {
  cameraStore.setCameraAddress(cameraAddress.value)
  cameraStore.toggleFormDisabled(true)
  const formIsValid = await form.value.validate()
  if (!formIsValid) return
  try {
    const response = await api.post('/startsign', { rtsp_url: cameraAddress.value })
    if (response.data.status === 'success') alert('正在打开摄像头，请稍等...')
  } catch (error) {
    console.log(error)
  }
}

const checkStatus = async () => {
  if (isRunning.value) {
    try {
      const response = await api.post('/stopsign')
      if (response.data.status === 'success') {
        statusMessage.value = '人脸识别已停止'
        statusType.value = 'success'
        checkButtonText.value = '检查人脸识别状态'
        checkButtonColor.value = 'primary'
        isRunning.value = false
        isFormDisabled.value = false
      }
      setTimeout(() => { statusMessage.value = ''; statusType.value = '' }, 5000)
    } catch {
      statusMessage.value = '停止失败，请稍后再试'
      statusType.value = 'error'
    }
  } else {
    try {
      checkButtonDisabled(true)
      checkButtonColor.value = 'green'
      checkButtonText.value = '停止检测'
      statusMessage.value = '正在检查人脸识别状态...'
      statusType.value = 'info'
      const response = await api.get('/isrunning')
      if (response.data.status === "success") {
        statusMessage.value = '人脸识别正在运行'
        statusType.value = 'success'
        isRunning.value = true
        isFormDisabled.value = true
      } else {
        statusMessage.value = '人脸识别未启动'
        statusType.value = 'error'
        checkButtonColor.value = 'primary'
        checkButtonText.value = '检查人脸识别状态'
      }
      setTimeout(() => { statusMessage.value = ''; statusType.value = '' }, 5000)
    } catch {
      statusMessage.value = '检查失败，请稍后再试'
      statusType.value = 'error'
    } finally {
      checkButtonDisabled(false)
    }
  }
}

const checkButtonDisabled = (status: boolean) => {
  isCheckButtonDisabled.value = status
}
</script>

<style scoped>
.camera-card {
  height: 150px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.start-btn {
  height: 56px;
  min-width: 100%;
  background-color: #1976D2;
  color: white;
}
.status-btn {
  width: 200px;
}
.status-alert {
  width: 300px;
}
.user-card {
  width: 150px;
  height: 230px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}
.user-card:hover {
  transform: scale(1.05);
}
.profile-img {
  margin: 10px auto;
  display: block;
  width: 120px;
  height: 120px;
  object-fit: cover; /* 确保图片不变形，充满指定大小 */
}

.user-name {
  /* font-size: 16px; */
  font-weight: bold;
  font-size: 14px; /* 调整字体大小 */
  margin: 5px 0;
}
.delete-action {
  justify-content: center;
  padding-top: 0;
  margin-top: 0; /* 减少上方间距 */
}
.upload-card {
  width: 150px;
  height: 180px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}
.upload-card:hover {
  background-color: #f5f5f5;
}
</style>
