import os from 'os'
import fs from 'fs'
import path from 'path'

import { Request, Response } from 'express'
import formidable from 'formidable'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'

ffmpeg.setFfmpegPath(ffmpegPath.path)

const VALID_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/3gpp']

export const compressVideo = (request: Request, response: Response) => {
    const form = formidable({})

    form.parse(request, (error, field, files) => {
      if (error) {
        return response.status(500).send('compress video failed')
      }

      if (!files.file || files.file.length === 0) {
        return response.status(400).send('no upload file')
      }

      const file = files.file[0]
      const mimetype = file.mimetype
      if (!mimetype || !VALID_VIDEO_MIME_TYPES.includes(mimetype)) {
        return response.status(400).send('invalid mimetype')
      }

      const tmpdir = os.tmpdir()
      const inputFileName = file.originalFilename ?? ''
      const [name, extension] = inputFileName?.split('.')
      const outputPath = path.join(tmpdir, `${name}-output.mp4`)
      // More dynamic to avoid too compress on small file size
      const compressNumber = file.size > 50 ? 30 : 22

      ffmpeg()
        .input(files.file![0].filepath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${compressNumber}`])
        .output(outputPath)
        .on('start', (commandProcess) => {
          console.info('ffmpeg compress start:', commandProcess)
        })
        .on('progress', (progress) => {
          console.info(`processing: ${Math.floor(progress.percent ?? 0)}% done`)
        })
        .on('end', () => {
          console.info('ffmpeg compress success')
          const buffer = fs.readFileSync(outputPath)
          fs.unlinkSync(outputPath)
          return response.send(buffer)
        })
        .on('error', function (error, stdout, stderr) {
          console.info(error.message)
          console.info('stdout:\n' + stdout)
          console.info('stderr:\n' + stderr)
          fs.unlinkSync(outputPath)
          return response.status(500).send('compress video failed')
        })
        .run()
    })
}