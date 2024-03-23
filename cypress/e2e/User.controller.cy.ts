import { faker } from "@faker-js/faker"

describe("User Controller", () => {
    it("enables creation and retrieval of a user", () => {
        const fakeEmail = faker.internet.email()
        const fakePassword = faker.internet.password()

        cy.request({
            method: "POST",
            url: "http://localhost:3001/user",
            body: JSON.stringify({
                email: fakeEmail,
                password: fakePassword
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            expect(response.status).to.eq(201) // Status code for created resource

            cy.request({
                method: "GET",
                url: `http://localhost:3001/user?email=${fakeEmail}&password=${fakePassword}`
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.have.property(
                    "isAuthenticated",
                    true
                )
            })
        })
    })
})
