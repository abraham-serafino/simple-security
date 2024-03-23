import db, { ITableResult } from "../lib/db"
import Joi from "joi"
import { DatabaseRecord } from "../lib/ValidatedObject"

interface IUserTableRow {
    id: number
    email: string
    password: string
    is_admin: boolean
}

interface IUser {
    id?: number | null
    email: string
    password?: string
    isAuthenticated?: boolean
    isAdmin?: boolean
}

class User extends DatabaseRecord {
    constructor({
        id = null,
        email,
        password = undefined,
        isAuthenticated = false,
        isAdmin = false
    }: IUser) {
        super(
            Joi.object({
                id: Joi.number().allow(null),
                email: Joi.string().required(),
                password: Joi.string().required(),
                isAuthenticated: Joi.boolean(),
                isAdmin: Joi.boolean()
            }),
            {
                id,
                email,
                password,
                isAuthenticated,
                isAdmin
            }
        )
    }
}

export default class UserDAO {
    data: User[] = []

    static fromRows(result: ITableResult<IUserTableRow>) {
        if (result?.rowCount || 0 >= 1) {
            return result.rows.map(
                ({ id, email, password, is_admin }) => ({
                    id,
                    email,
                    password,
                    isAuthenticated: true,
                    isAdmin: is_admin
                })
            )
        } else {
            return []
        }
    }

    async find(email: string, password?: string) {
        const user = new User({
            email,
            password
        })

        const result = await db().query(
            `
            SELECT id, email, password, is_admin
            FROM users
            WHERE email = $1 AND password = $2
        `,
            [user.email, user.password]
        )

        this.data = UserDAO.fromRows(result)
        console.log(this.data)
        return this.data
    }

    async save(
        email: string,
        password: string,
        isAdmin: boolean = false
    ) {
        const user = new User({
            email,
            password,
            isAdmin
        })

        await this.find(email, password)

        if (this.data.length >= 1) {
            const { id } = this.data[0]

            const result = await db().query(
                `
                UPDATE users
                SET is_admin = $1
                WHERE id = $2
                RETURNING *
            `,
                [user.isAdmin, id]
            )

            this.data = UserDAO.fromRows(result)
        } else {
            const result = await db().query(
                `
                INSERT INTO users (email, password, is_admin)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
                [user.email, user.password, user.isAdmin]
            )

            this.data = UserDAO.fromRows(result)
        }

        return this.data
    }
}
