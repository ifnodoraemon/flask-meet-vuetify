// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // 替换为实际的 API 基础 URL
  timeout: 10000, // 请求超时时间，单位为毫秒
})

export default api
