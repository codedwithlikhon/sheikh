<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
        <p class="text-gray-600 mt-1">Manage your AI agent tasks</p>
      </div>
      <button class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        New Task
      </button>
    </div>

    <!-- Tasks List -->
    <div class="card">
      <div class="text-center py-12">
        <CheckSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Tasks Coming Soon</h3>
        <p class="text-gray-500">Task management features will be available soon</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, CheckSquare } from 'lucide-vue-next'
</script>

