/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'

const componentsRouter = {
  path: '/assets',
  component: Layout,
  redirect: 'assets',
  name: 'assets',
  meta: {
    title: 'assets',
    icon: 'assets'
  },
  children: [
    {
      path: 'assets',
      component: () => import('@/views/assets/assets'),
      name: 'assets',
      meta: { title: 'assets' }
    }
  ]
}

export default systemRouter
