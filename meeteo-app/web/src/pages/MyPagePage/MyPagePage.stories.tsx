import type { Meta, StoryObj } from '@storybook/react'

import MyPagePage from './MyPagePage'

const meta: Meta<typeof MyPagePage> = {
  component: MyPagePage,
}

export default meta

type Story = StoryObj<typeof MyPagePage>

export const Primary: Story = {}
