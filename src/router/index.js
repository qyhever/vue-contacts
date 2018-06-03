import Vue from 'vue'
import Router from 'vue-router'
import contacts from '@/components/contacts'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: contacts
    }
  ]
})
