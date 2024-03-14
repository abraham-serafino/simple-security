require("dotenv").config()
const { Users } = require("./user/user.model")

;(async () => {
    const users = new Users()

    let result = await users.save("anywhere@example.com", "Password")
    console.log(1, result)

    result = await users.save("anywhere@example.com", "Password", true)
    console.log(2, result)
})()
