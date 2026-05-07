import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthModal from './AuthModal.vue'

describe('AuthModal register validation', () => {
  it('shows username and password requirements in register mode', () => {
    const wrapper = mount(AuthModal, {
      props: {
        isOpen: true,
        mode: 'register'
      }
    })

    expect(wrapper.text()).toContain('Username')
    expect(wrapper.text()).toContain('Password')
  })

  it('shows an error for invalid username on submit', async () => {
    const wrapper = mount(AuthModal, {
      props: {
        isOpen: true,
        mode: 'register'
      }
    })

    const inputs = wrapper.findAll('input')
    const usernameInput = inputs[0]
    const emailInput = inputs[1]
    const passwordInput = inputs[2]
    const confirmPasswordInput = inputs[3]

    await usernameInput.setValue('bad_user!!')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('SecurePass1!')
    await confirmPasswordInput.setValue('SecurePass1!')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Username')
    expect(wrapper.text()).toContain('Username can only contain letters, numbers, underscores, and hyphens.')
  })

  it('shows an error for weak password on submit', async () => {
    const wrapper = mount(AuthModal, {
      props: {
        isOpen: true,
        mode: 'register'
      }
    })

    const inputs = wrapper.findAll('input')
    const usernameInput = inputs[0]
    const emailInput = inputs[1]
    const passwordInput = inputs[2]
    const confirmPasswordInput = inputs[3]

    await usernameInput.setValue('ValidUser1')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('weakpass')
    await confirmPasswordInput.setValue('weakpass')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Password does not meet the required conditions.')
  })

  it('emits submit when register data is valid', async () => {
    const wrapper = mount(AuthModal, {
      props: {
        isOpen: true,
        mode: 'register'
      }
    })

    const inputs = wrapper.findAll('input')
    const usernameInput = inputs[0]
    const emailInput = inputs[1]
    const passwordInput = inputs[2]
    const confirmPasswordInput = inputs[3]

    await usernameInput.setValue('ValidUser1')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('SecurePass1!')
    await confirmPasswordInput.setValue('SecurePass1!')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('shows an error when confirm password does not match', async () => {
    const wrapper = mount(AuthModal, {
        props: {
        isOpen: true,
        mode: 'register'
        }
    })

    const inputs = wrapper.findAll('input')
    const usernameInput = inputs[0]
    const emailInput = inputs[1]
    const passwordInput = inputs[2]
    const confirmPasswordInput = inputs[3]

    await usernameInput.setValue('ValidUser1')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('SecurePass1!')
    await confirmPasswordInput.setValue('DifferentPass1!')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Passwords do not match.')
  })

  it('switches from register to login when toggle button is clicked', async () => {
    const wrapper = mount(AuthModal, {
        props: {
        isOpen: true,
        mode: 'register'
        }
    })

    const buttons = wrapper.findAll('button')
    const toggleButton = buttons.find((btn) => btn.text() === 'Login')

    await toggleButton.trigger('click')

    expect(wrapper.emitted('switch-mode')).toBeTruthy()
  })

})