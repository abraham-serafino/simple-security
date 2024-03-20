import { Response } from "express"

export function get(_: never, response: Response<string>) {
    response.send("Hello world")
}
