import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/detailChart',
    //   name: 'detailChart',
    //   component: ()=>import("@/views/Chart.vue"),
    // }
  ],
})

export default router
