// src/app.ts
import express, { Express } from 'express'
import { CommonController, CompressFileController } from './controllers'

const app: Express = express()

const port: number = 3000

app.post('/compress/video', CompressFileController.compressVideo)


app.get('/', CommonController.online)

app.listen(port, () => console.log(`Running at http://localhost:${port}`))
