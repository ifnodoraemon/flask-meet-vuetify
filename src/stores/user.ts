import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useUserStore = defineStore('user', () => {
  const userData = ref([]); // 存储用户数据
  const page = ref(1);
  const pages = ref(1);
  const perPage = ref(10);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);


  const deleteFace = async (name) => {
    try {
      const response = await api.delete('/deleteface', {
        data: { name }  // 传递 name 参数到后端
      });
      // console.log("=====",response.data.message);
      if (response.data.status === 'success') {
        console.log('用户删除成功');
        // 可以在此处执行刷新用户数据或其他操作
      } else {
        console.error('删除失败:', response.data.message);
      }
    } catch (error) {
      console.error('删除用户失败：', error);
    }
  };  
  // 异步 action 来获取用户数据
  const fetchUserData = async (currentPage = page.value) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/users', {
        params: {
          page: currentPage,
          per_page: perPage.value,
        },
      });

      const data = response.data;
      // 更新 store 中的数据
      userData.value = data.users;
      page.value = data.page;
      pages.value = data.pages;
      perPage.value = data.per_page;
      total.value = data.total;
    } catch (err) {
      error.value = '加载数据失败，请稍后再试';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // 提供分页请求的操作方法
  const loadNextPage = () => {
    if (page.value < pages.value) {
      fetchUserData(page.value + 1);
    }
  };

  const loadPreviousPage = () => {
    if (page.value > 1) {
      fetchUserData(page.value - 1);
    }
  };

  // 返回 store 的数据和方法
  return {
    userData,
    page,
    pages,
    perPage,
    total,
    loading,
    error,
    fetchUserData,
    deleteFace,
    loadNextPage,
    loadPreviousPage,
  };
});
