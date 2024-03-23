import { Request, response, Response } from "express"
import UserDAO from "./User.dao"
import { ValidatedDTO } from "../lib/ValidatedObject"
import Joi from "joi"

class UserRequest extends ValidatedDTO {
    constructor(
        public email: string,
        public password?: string
    ) {
        super(
            Joi.object({
                email: Joi.string().required(),
                password: Joi.string().required()
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
            const [user] = await dao.find(
                userDTO.email,
                userDTO.password
            )

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

    static async save(request: Request, response: Response) {
        const { email, password } = request.body as {
            email: string
            password: string
        }

        const userDTO = new UserRequest(email, password)

        if (!userDTO.validate(response)) {
            return
        }

        try {
            const dao = new UserDAO()

            return dao.save(
                userDTO.email,
                userDTO.password as string,
                false
            )
        } catch (e) {
            response.sendStatus(500)
        }
    }

    static async put(request: Request, response: Response) {
        const user = UserController.save(request, response)

        if (!user) {
            response.sendStatus(500)
        } else {
            response.sendStatus(200)
        }
    }

    static async post(request: Request, response: Response) {
        const user = UserController.save(request, response)

        if (!user) {
            response.sendStatus(500)
        } else {
            response.sendStatus(201)
        }
    }
}
