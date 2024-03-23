import { Request, Response } from "express"
import UserDAO from "./User.dao"
import { DTO } from "../lib/ValidatedObject"
import Joi from "joi"

class UserRequest extends DTO {
    constructor(
        public email: string,
        public password?: string,
        public isAuthenticated: boolean = false
    ) {
        super(
            Joi.object({
                email: Joi.string().required(),
                password: Joi.string().required(),
                isAuthenticated: Joi.boolean()
            })
        )
    }
}

class UserResponse {
    constructor(public isAuthenticated: boolean = false) {}
}

export default class UserController {
    static async get(request: Request, response: Response) {
        const { email, password } = request.query as {
            email: string
            password: string
        }

        const userDTO = new UserRequest(email, password)

        if (!userDTO.validate(response)) {
            return
        }

        try {
            const dao = new UserDAO()
            const [user] = await dao.find(email, password)

            if (user) {
                const { isAuthenticated } = user
                return response.json(new UserResponse(isAuthenticated))
            } else {
                return response.sendStatus(404)
            }
        } catch (e) {
            response.sendStatus(500)
        }
    }
}
