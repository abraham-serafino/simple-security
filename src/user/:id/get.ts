import { Request, Response } from "express"

export default (request: Request, response: Response<string>) => {
    response.send(`User #${request.params.id}`)
}
