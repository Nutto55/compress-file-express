import { Request, Response } from 'express'

export const online = (request: Request, response: Response) => {
    return response.send('online!')
}
