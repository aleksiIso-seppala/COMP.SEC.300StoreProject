import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ItemView from './ItemView.vue'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>'
  },
  useRoute: () => ({
    params: { slug: 'cairn' }
  })
}))

vi.mock('../utils/reviews', () => ({
  postReview: vi.fn()
}))

vi.mock('../utils/auth', () => ({
  getCurrentUser: vi.fn()
}))

import { getCurrentUser } from '../utils/auth'

describe('ItemView review visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ reviews: [] })
        })
      )
    )
  })

  it('shows login prompt when no user is logged in', async () => {
    getCurrentUser.mockResolvedValue(null)

    const wrapper = mount(ItemView)
    await flushPromises()

    expect(wrapper.text()).toContain('Please log in to leave a review.')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows review form when a user is logged in', async () => {
    getCurrentUser.mockResolvedValue({
      id: 'u1',
      username: 'TestUser',
      slug: 'testuser'
    })

    const wrapper = mount(ItemView)
    await flushPromises()

    expect(wrapper.text()).toContain('Leave a review')
    expect(wrapper.find('form').exists()).toBe(true)
  })
})