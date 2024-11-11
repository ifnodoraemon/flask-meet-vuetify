<template>
    <v-container>
      <!-- 顶部统计卡片行 -->
      <v-row class="mb-6">
        <v-col cols="4">
          <v-card outlined class="text-center py-4">
            <v-card-title class="text-h6">全部人员</v-card-title>
            <v-card-text class="text-h5 font-weight-bold">{{totalUsers}}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card outlined class="text-center py-4">
            <v-card-title class="text-h6">已签到</v-card-title>
            <v-card-text class="text-h5 font-weight-bold text-success">{{ signedUsers }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card outlined class="text-center py-4">
            <v-card-title class="text-h6">未签到</v-card-title>
            <v-card-text class="text-h5 font-weight-bold text-error">{{ notSignedUsers }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 签到人员明细表 -->
      <v-row>
        <v-col cols="12">
          <v-card outlined style="min-height: 600px;">
            <v-card-title class="d-flex align-center py-4">
              <v-icon color="primary" large icon="mdi-video-input-component"></v-icon>
              <span class="ms-2 text-h6">签到人员明细表</span>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                density="compact"
                label="搜索"
                prepend-inner-icon="mdi-magnify"
                variant="solo-inverted"
                flat
                hide-details
                single-line
              ></v-text-field>
            </v-card-title>
  
            <!-- 数据表格 -->
            <v-data-table
              :headers="headers"
              :items="userData"
              :search="search"
              density="comfortable"
              class="elevation-1"
            >
              <!-- 人脸照片插槽 -->
              <template v-slot:item.img_face="{ item }">
                <div class="img-cell">
                  <v-card elevation="2" rounded width="64" height="64">
                    <!-- 处理base64编码，确保图片渲染 -->
                    <v-img :src="'data:image/jpeg;base64,' + item.img_face" height="64" cover></v-img>
                  </v-card>
                </div>
              </template>
  
              <!-- 签到状态插槽 -->
              <template v-slot:item.is_sign="{ item }">
                <span :class="{
                  'status-chip': true,
                  'status-signed': item.is_sign,
                  'status-not-signed': !item.is_sign
                }">
                  {{ item.is_sign ? '已签到' : '未签到' }}
                </span>
              </template>
  
              <!-- 签到照片插槽 -->
              <template v-slot:item.img_sign="{ item }">
                <div class="img-cell">
                  <v-card elevation="2" rounded width="64" height="64">
                    <!-- 处理base64编码，确保图片渲染 -->
                    <v-img :src="'data:image/jpeg;base64,' + item.img_sign" height="64" cover></v-img>
                  </v-card>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'
  import axios from 'axios'
  import api from '@/services/api'  
  // 使用 Pinia Store 获取用户数据
  const userStore = useUserStore()
  const search = ref('')
  const headers = ref([
    { align: 'start', key: 'name', sortable: false, title: '人员姓名' },
    { align: 'center', key: 'img_face', title: '人脸照片' },
    { align: 'center', key: 'is_sign', title: '签到状态' },
    { align: 'center', key: 'img_sign', title: '签到照片' },
  ])
  
  // 初始化用户数据
  const userData = ref([])
  
  // 统计数据
  const totalUsers = ref(0)
  const signedUsers = ref(0)
  const notSignedUsers = ref(0)
  
  // 获取用户数据的函数
  const fetchUserData = async () => {
    try {
      // 使用分页接口获取用户数据
      await userStore.fetchUserData()  // 从 store 获取分页数据
      userData.value = userStore.userData // 更新组件的用户数据
    } catch (error) {
      console.error('获取用户数据失败:', error)
    }
  }
  
  // 获取统计数据的函数
  const fetchStatsData = async () => {
    try {
      // 使用 stats 接口获取完整的统计信息
      const response = await api.get('/stats')  // 替换为实际的统计接口
      console.log(response.data)
      totalUsers.value = response.data.total_users // 总人数
      signedUsers.value = response.data.signed_in_users // 已签到人数
      notSignedUsers.value = response.data.not_signed_in_users // 未签到人数
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchUserData()   // 获取分页数据
    fetchStatsData()  // 获取统计数据
  })
  </script>
  
  
  <style scoped>
  .text-center {
    text-align: center;
  }
  .text-success {
    color: #4caf50;
  }
  .text-error {
    color: #f44336;
  }
  .status-chip {
    display: inline-block;
    padding: 4px 8px;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 16px;
    color: #fff;
  }
  .status-signed {
    background-color: #4caf50;
  }
  .status-not-signed {
    background-color: #f44336;
  }
  .img-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  </style>
  