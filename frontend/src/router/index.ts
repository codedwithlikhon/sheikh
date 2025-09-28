import { RouteRecordRaw } from 'vue-router'

// Import views
import Dashboard from '@/views/Dashboard.vue'
import Sessions from '@/views/Sessions.vue'
import Tasks from '@/views/Tasks.vue'
import Executions from '@/views/Executions.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: Sessions,
    meta: {
      title: 'Sessions'
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: {
      title: 'Tasks'
    }
  },
  {
    path: '/executions',
    name: 'Executions',
    component: Executions,
    meta: {
      title: 'Executions'
    }
  }
]

