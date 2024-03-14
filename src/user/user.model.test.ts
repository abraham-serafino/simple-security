import db from "../lib/db"
import { Users } from "./user.model"

test("insert users", async () => {
    await db().query(`delete from users`)

    const users = new Users()
    await users.save("test_user1@email.com", "test_password1")
    await users.save("test_user2@email.com", "test_password2", true)
    await users.save("test_user3@email.com", "test_password3")

    const result1 = await users.find(
        "test_user1@email.com",
        "test_password1"
    )
    expect(result1).toHaveLength(1)
    expect(result1[0].isAdmin).toBe(false)

    const result2 = await users.find(
        "test_user2@email.com",
        "test_password2"
    )
    expect(result2).toHaveLength(1)
    expect(result2[0].isAdmin).toBe(true)
})

test("update users", async () => {
    await db().query(`delete from users`)

    const users = new Users()
    const [result1] = await users.save(
        "test_user1@email.com",
        "test_password1"
    )
    expect(result1.isAdmin).toBe(false)

    const [result2] = await users.save(
        "test_user1@email.com",
        "test_password1",
        true
    )
    expect(result2.isAdmin).toBe(true)
})
