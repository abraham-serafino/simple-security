import db from "../lib/db"
import Joi from "joi"

interface IUserTableRow {
    id: number
    email: string
    password: string
    is_admin: boolean
}

interface IUserTableResult {
    rowCount: number | null
    rows: IUserTableRow[]
}

export class User {
    static schema = Joi.object({
        id: Joi.number().allow(null),
        email: Joi.string().required(),
        password: Joi.string().required(),
        isAuthenticated: Joi.boolean(),
        isAdmin: Joi.boolean()
    })

    constructor(
        public id: number | null = null,
        public email: string,
        public password: string,
        public isAuthenticated: boolean = false,
        public isAdmin: boolean = false
    ) {
        const { error } = User.schema.validate(
            {
                id,
                email,
                password,
                isAuthenticated,
                isAdmin
            },
            { abortEarly: false }
        )

        if (error) {
            throw new TypeError(JSON.stringify(error.details, null, 2))
        }
    }
}

export class Users {
    data: User[] = []

    private static fromRow({
        id,
        email,
        password,
        is_admin
    }: IUserTableRow) {
        return new User(id, email, password, true, is_admin)
    }

    static fromRows(result: IUserTableResult) {
        if (result?.rowCount || 0 >= 1) {
            return result.rows.map((row) => this.fromRow(row))
        } else {
            return []
        }
    }

    async find(_email: string, _password: string) {
        const { email, password } = new User(null, _email, _password)

        const result = await db().query(
            `
            SELECT id, email, password, is_admin
            FROM users
            WHERE email = $1 AND password = $2
        `,
            [email, password]
        )

        this.data = Users.fromRows(result)
        return this.data
    }

    async save(
        _email: string,
        _password: string,
        _isAdmin: boolean = false
    ) {
        const { email, password, isAdmin } = new User(
            null,
            _email,
            _password,
            false,
            _isAdmin
        )

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
                [isAdmin, id]
            )

            this.data = Users.fromRows(result)
        } else {
            const result = await db().query(
                `
                INSERT INTO users (email, password, is_admin)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
                [email, password, isAdmin]
            )

            this.data = Users.fromRows(result)
        }

        return this.data
    }
}
