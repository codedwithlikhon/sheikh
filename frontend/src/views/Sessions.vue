<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Sessions</h1>
        <p class="text-gray-600 mt-1">Manage your conversation sessions</p>
      </div>
      <button class="btn btn-primary" @click="createNewSession">
        <Plus class="w-4 h-4 mr-2" />
        New Session
      </button>
    </div>

    <!-- Sessions List -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">All Sessions</h2>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sessions..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ session.title }}</h3>
              <p class="text-sm text-gray-500">{{ session.description || 'No description' }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ session.totalMessages }} messages • {{ session.lastMessageAt }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span :class="getStatusClass(session.status)">{{ session.status }}</span>
            <div class="flex items-center space-x-2">
              <button
                @click="openSession(session.id)"
                class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="Open Session"
              >
                <ExternalLink class="w-4 h-4" />
              </button>
              <button
                @click="editSession(session.id)"
                class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="Edit Session"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="deleteSession(session.id)"
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Session"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSessions.length === 0" class="text-center py-12">
        <MessageSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
        <p class="text-gray-500 mb-4">Get started by creating your first session</p>
        <button class="btn btn-primary" @click="createNewSession">
          <Plus class="w-4 h-4 mr-2" />
          Create Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, 
  MessageSquare, 
  Search, 
  ExternalLink, 
  Edit, 
  Trash2 
} from 'lucide-vue-next'

// Types
interface Session {
  id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'paused' | 'failed'
  totalMessages: number
  lastMessageAt: string
  createdAt: string
}

// Reactive data
const sessions = ref<Session[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)

// Computed
const filteredSessions = computed(() => {
  let filtered = sessions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(session =>
      session.title.toLowerCase().includes(query) ||
      session.description?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(session => session.status === statusFilter.value)
  }

  return filtered
})

// Methods
const getStatusClass = (status: string) => {
  const classes = {
    active: 'status-active',
    completed: 'status-completed',
    paused: 'status-pending',
    failed: 'status-failed'
  }
  return classes[status as keyof typeof classes] || 'status-pending'
}

const createNewSession = () => {
  // TODO: Implement session creation
  console.log('Creating new session...')
}

const openSession = (sessionId: string) => {
  // TODO: Navigate to session detail
  console.log('Opening session:', sessionId)
}

const editSession = (sessionId: string) => {
  // TODO: Open session edit modal
  console.log('Editing session:', sessionId)
}

const deleteSession = (sessionId: string) => {
  // TODO: Implement session deletion
  console.log('Deleting session:', sessionId)
}

const loadSessions = async () => {
  loading.value = true
  try {
    // TODO: Implement API call to load sessions
    // Mock data for now
    sessions.value = [
      {
        id: '1',
        title: 'Data Analysis Project',
        description: 'Analyzing customer data for insights',
        status: 'active',
        totalMessages: 24,
        lastMessageAt: '2 minutes ago',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Web Scraping Task',
        description: 'Scraping product information from e-commerce sites',
        status: 'active',
        totalMessages: 18,
        lastMessageAt: '15 minutes ago',
        createdAt: '2024-01-15T09:15:00Z'
      },
      {
        id: '3',
        title: 'API Integration',
        description: 'Integrating with third-party APIs',
        status: 'completed',
        totalMessages: 42,
        lastMessageAt: '1 hour ago',
        createdAt: '2024-01-14T14:20:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load sessions:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadSessions()
})
</script>

