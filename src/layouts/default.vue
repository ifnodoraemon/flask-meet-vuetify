<template>
  <v-responsive class="border rounded">
    <v-app>
      <!-- 顶部应用栏 -->
      <v-app-bar color="primary" dark title="宁夏移动无感签到系统">
        <!-- <v-toolbar-title class="text-h6 font-weight-bold">宁夏移动</v-toolbar-title> -->
      </v-app-bar>

      <!-- 侧边导航栏 -->
      <v-navigation-drawer app color="white lighten-4">
        <v-list dense>
          <v-list-item to="/" class="text-primary">
            <v-list-item-title>首页</v-list-item-title>
          </v-list-item>
          <v-list-item to="/setting" class="text-primary">
            <v-list-item-title>设置</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- 主内容 -->
      <v-main>
        <v-container class="py-6">
          <router-view />
        </v-container>
      </v-main>

      <!-- 底部栏 -->
      <AppFooter />
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
</script>

<style scoped>
.v-list-item {
  transition: background-color 0.3s;
}
.v-list-item:hover {
  background-color: #e0e0e0;
}
.v-list-item .v-list-item-title {
  font-weight: 500;
}
</style>
