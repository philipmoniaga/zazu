import { spawn } from 'child_process'
import cuid from 'cuid'

export default class RootScript {
  constructor (data) {
    this.id = data.id || cuid()
    this.script = data.script
    this.respondsTo = data.respondsTo
    this.connections = data.connections
    this.cwd = data.cwd
  }

  call (input, env = {}) {
    const command = this.script.split(' ')[0]
    const args = this.script
      .replace('{query}', input)
      .split(' ')
      .slice(1)
    const cmd = spawn(command, args, {
      cwd: this.cwd,
      env: Object.assign({}, process.env, env),
    })

    return new Promise((resolve, reject) => {
      let output = ''
      let error = ''

      cmd.stdout.on('data', (data) => {
        output += data
      })

      cmd.stderr.on('data', (data) => {
        error += data
      })

      cmd.on('close', (code) => {
        if (code === 0) { resolve(JSON.parse(output)) }
        if (code !== 0) { reject(error) }
      })
    })
  }
}