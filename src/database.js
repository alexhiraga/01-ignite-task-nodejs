import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }


    select(table, search) {
        let data = this.#database[table] ?? []

        if(search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if(Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if(rowIndex > -1) {
            if(!data.completed_at) {
                //put method
                this.#database[table][rowIndex] = { ...this.#database[table][rowIndex], ...cleanObject(data)}
            } else {
                //patch method                
                if(this.#database[table][rowIndex].completed_at) {
                    // set task not completed
                    this.#database[table][rowIndex] = { ...this.#database[table][rowIndex], ...{ completed_at: null }}
                } else {
                    // set task completed
                    this.#database[table][rowIndex] = { ...this.#database[table][rowIndex], ...data}
                }
            }
            this.#persist()
            return true
        } else {
            return false
        }
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if(rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
            return true
        } else {
            return false
        }
    }
}

// clean object if value is not provided
function cleanObject(obj) {
    const cleanedObject = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
            cleanedObject[key] = obj[key];
        }
    }
    return cleanedObject;
}