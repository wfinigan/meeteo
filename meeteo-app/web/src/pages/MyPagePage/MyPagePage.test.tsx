import { render } from '@redwoodjs/testing/web'

import MyPagePage from './MyPagePage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('MyPagePage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<MyPagePage />)
    }).not.toThrow()
  })
})
