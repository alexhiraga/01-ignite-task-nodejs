import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            if(!req.body) {
                return res.writeHead(400).end()
            }
            const { title, description } = req.body

            if(!title || !description) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end('Please inform the task title and description.')
            }
            
            const task = {
                id: randomUUID(),
                title,
                description,
                created_at: new Date(),
                updated_at: new Date(),
                completed_at: null
            }

            database.insert('tasks', task)
            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body
            
            if(!id) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end('Please inform the task id.')
            }
            if(!title && !description) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end('Please inform the task title or description to be updated.')
            }

            const isUpdated = database.update('tasks', id, {
                title,
                description,
                updated_at: new Date()
            })

            if(!isUpdated) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end("The task id does not exist on database.")
            }

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            
            if(!id) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end('Please inform the task id.')
            }

            const isUpdated = database.update('tasks', id, {
                completed_at: new Date()
            })

            if(!isUpdated) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end("The task id does not exist on database.")
            }

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            if(!id) {
                return res.writeHead(400).end('Please inform the task id.')
            }

            const isDeleted = database.delete('tasks', id)

            if(!isDeleted) {
                return res
                    .writeHead(400, { 'Content-Type': 'text/plain' })
                    .end("The task id does not exist on database.")
            }

            return res.writeHead(204).end()
        }
    },
]

