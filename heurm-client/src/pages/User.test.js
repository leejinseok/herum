const User = require("./User")
// @ponicode
describe("componentDidMount", () => {
    let inst

    beforeEach(() => {
        inst = new User.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.componentDidMount()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("componentWillUnmount", () => {
    let inst

    beforeEach(() => {
        inst = new User.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.componentWillUnmount()
        }
    
        expect(callFunction).not.toThrow()
    })
})
