import Joi from "joi"
import { Response } from "express"

class ValidatedObject {
    constructor(
        public schema?: Joi.Schema,
        fields?: Record<string, any>
    ) {}

    protected _validate?() {
        const thisAsDTO = { ...this }
        delete thisAsDTO.schema

        const { error = undefined } =
            this.schema?.validate(thisAsDTO, {
                abortEarly: false
            }) || {}

        return error
    }
}

export class DatabaseRecord extends ValidatedObject {
    [fieldName: string]: any

    constructor(schema?: Joi.Schema, fields: Record<string, any> = {}) {
        super(schema)

        for (const fieldName of Object.keys(fields)) {
            this[fieldName] = fields[fieldName]
        }

        this.validate?.()
    }

    validate?() {
        const error = this._validate?.()

        if (error) {
            throw new TypeError(JSON.stringify(error.details, null, 2))
        }
    }
}

export class DTO extends ValidatedObject {
    validate(response: Response) {
        const error = this._validate?.()

        if (error) {
            response
                .status(400)
                .json(error.details.map(({ message }) => message))
            return false
        }

        return true
    }
}
