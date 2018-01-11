import Vue from 'vue'
import Router from 'vue-router'
import MainLayout from '@/components/MainLayout'
import ParkTab from '@/components/ParkTab'
import ParkHistoryTab from '@/components/ParkHistoryTab'

Vue.use(Router)

export default new Router({
  routes: [
      {
          path: '/park',
          name: 'Park',
          component: ParkTab
      },
      {
          path: '/history',
          name: 'history',
          component: ParkHistoryTab
      },
  ]
})
