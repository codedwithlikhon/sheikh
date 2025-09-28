<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">S</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Sheikh</span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Sun v-if="isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
            </button>
            
            <button
              @click="toggleSidebar"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex">
      <!-- Sidebar -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="flex flex-col h-full">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          
          <nav class="flex-1 p-4 space-y-2">
            <router-link
              to="/"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              :class="{ 'bg-primary-100 text-primary-700': $route.path === '/' }"
            >
              <Home class="w-5 h-5" />
              <span>Dashboard</span>
            </router-link>
            
            <router-link
              to="/sessions"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              :class="{ 'bg-primary-100 text-primary-700': $route.path.startsWith('/sessions') }"
            >
              <MessageSquare class="w-5 h-5" />
              <span>Sessions</span>
            </router-link>
            
            <router-link
              to="/tasks"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              :class="{ 'bg-primary-100 text-primary-700': $route.path.startsWith('/tasks') }"
            >
              <CheckSquare class="w-5 h-5" />
              <span>Tasks</span>
            </router-link>
            
            <router-link
              to="/executions"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              :class="{ 'bg-primary-100 text-primary-700': $route.path.startsWith('/executions') }"
            >
              <Terminal class="w-5 h-5" />
              <span>Executions</span>
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 lg:ml-0">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Sidebar Overlay (Mobile) -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Terminal, 
  Menu, 
  Sun, 
  Moon 
} from 'lucide-vue-next'

// Theme management
const isDark = useDark()
const toggleTheme = useToggle(isDark)

// Sidebar management
const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<style scoped>
/* Custom styles if needed */
</style>

