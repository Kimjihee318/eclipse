import {hello} from '../src/dummy'


describe("Dummy", () => {
  it("dummy", () => {
    expect(hello()).toEqual('Hello')
  })
})
