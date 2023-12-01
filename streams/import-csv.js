import fs from 'node:fs'
import { parse } from 'csv-parse'

const csvFile = new URL('./tasks.csv', import.meta.url)

const processFile = async () => {
    const records = [];
    const parser = fs
        .createReadStream(csvFile)
        .pipe(parse({
            // CSV options if any
        }));
    for await (const record of parser) {
        // Work with each record
        const task = {
            title: record[0],
            description: record[1]
        }

        records.push(record);

        await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(task)
        })
    }

    return records;
}

(async () => {
    await processFile();
})();