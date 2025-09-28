<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">Welcome to Sheikh - Your AI Action Engine</p>
      </div>
      <button class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        New Session
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-primary-100 rounded-lg">
            <MessageSquare class="w-6 h-6 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Active Sessions</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.activeSessions }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckSquare class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Completed Tasks</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.completedTasks }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Terminal class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Code Executions</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.codeExecutions }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Clock class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Avg. Response Time</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.avgResponseTime }}ms</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
        <div class="space-y-3">
          <div
            v-for="session in recentSessions"
            :key="session.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p class="font-medium text-gray-900">{{ session.title }}</p>
                <p class="text-sm text-gray-500">{{ session.lastMessageAt }}</p>
              </div>
            </div>
            <span class="status-active">{{ session.status }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <button class="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Code class="w-5 h-5 text-primary-600" />
            <div>
              <p class="font-medium text-gray-900">Execute Code</p>
              <p class="text-sm text-gray-500">Run Python, JavaScript, or other code</p>
            </div>
          </button>
          
          <button class="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <FileText class="w-5 h-5 text-primary-600" />
            <div>
              <p class="font-medium text-gray-900">Create Document</p>
              <p class="text-sm text-gray-500">Generate and edit documents</p>
            </div>
          </button>
          
          <button class="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Search class="w-5 h-5 text-primary-600" />
            <div>
              <p class="font-medium text-gray-900">Web Search</p>
              <p class="text-sm text-gray-500">Search the web for information</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Plus, 
  MessageSquare, 
  CheckSquare, 
  Terminal, 
  Clock, 
  Code, 
  FileText, 
  Search 
} from 'lucide-vue-next'

// Reactive data
const stats = ref({
  activeSessions: 12,
  completedTasks: 156,
  codeExecutions: 89,
  avgResponseTime: 245
})

const recentSessions = ref([
  {
    id: '1',
    title: 'Data Analysis Project',
    status: 'active',
    lastMessageAt: '2 minutes ago'
  },
  {
    id: '2',
    title: 'Web Scraping Task',
    status: 'active',
    lastMessageAt: '15 minutes ago'
  },
  {
    id: '3',
    title: 'API Integration',
    status: 'completed',
    lastMessageAt: '1 hour ago'
  }
])

// Lifecycle
onMounted(() => {
  // Load dashboard data
  loadDashboardData()
})

// Methods
const loadDashboardData = async () => {
  try {
    // TODO: Implement API calls to load dashboard data
    console.log('Loading dashboard data...')
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}
</script>

