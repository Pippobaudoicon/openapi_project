// Used to process the companies.csv file and add the taxCodeCeased field to the output-closed-companies.csv file ONE TIME SCRIPT
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axiosOpenapi from '../../utils/axiosOpenapi.js';
import { __dirname } from '../paths.js';
import { stringify } from 'csv-stringify';
import { finished } from 'stream/promises';
import pLimit from 'p-limit';

const inputFilePath = path.join(__dirname, '../../companies/companies.csv');
const outputFilePath = path.join(__dirname, '../../companies/output-closed-companies.csv');

const processCsv = async () => {
    const results = [];
    const outputStream = fs.createWriteStream(outputFilePath);
    const stringifier = stringify({ header: true });

    // Pipe the stringifier to the output stream
    stringifier.pipe(outputStream);

    const stream = fs.createReadStream(inputFilePath).pipe(csv());

    const limit = pLimit(10); // Limit the number of concurrent promises
    const promises = [];

    stream.on('data', (row) => {
        const piva = row.piva ? row.piva.trim() : null;
        if (!piva) {
            console.error(`Missing piva in row: ${JSON.stringify(row)}`);
            return;
        }
        const promise = limit(() => axiosOpenapi.get(`/IT-closed/${piva}`)
            .then(response => {
                const taxCodeCeased = response.data[0]?.taxCodeCeased ? 1 : 0;
                const result = {
                    piva: piva,
                    taxCodeCeased: taxCodeCeased
                };
                results.push(result);
                stringifier.write(result);

                // Log memory usage
                const memoryUsage = process.memoryUsage();
                console.log(`Memory Usage: RSS=${memoryUsage.rss}, HeapTotal=${memoryUsage.heapTotal}, HeapUsed=${memoryUsage.heapUsed}, External=${memoryUsage.external}`);
            })
            .catch(error => {
                let status = error.status;
                if (status === 406) { // Not valid
                    const result = {
                        piva: piva,
                        taxCodeCeased: null
                    };
                    results.push(result);
                    stringifier.write(result);
                }
                console.error(`Error processing row: ${JSON.stringify(row)}`, error.status, error.response.data);
            }));
        promises.push(promise);
    });

    stream.on('error', (error) => {
        console.error('Error reading CSV file', error);
    });

    await finished(stream);
    await Promise.all(promises);

    console.log('CSV file successfully processed.');
    stringifier.end();
};

export default processCsv;