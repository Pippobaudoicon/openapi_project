// Used to process the companies.csv file and add the taxCodeCeased field to the output-closed-companies.csv file ONE TIME SCRIPT
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as rfs from 'rotating-file-stream';
import axiosOpenapi from '../axiosCompanyOpenapi.js';
import { __dirname } from '../paths.js';
import { stringify } from 'csv-stringify';
import { finished } from 'stream/promises';
import pLimit from 'p-limit';

const inputFilePath = path.join(__dirname, '../companies/companies.csv');
const outputFilePath = path.join(__dirname, '../companies/output-closed-companies.csv');
const errorLogDir = path.join(__dirname, '../logs/errors');

// Ensure error log directory exists
if (!fs.existsSync(errorLogDir)) {
    fs.mkdirSync(errorLogDir, { recursive: true });
}

// Create error log stream
const errorLogStream = rfs.createStream('process-errors.log', {
    interval: '1d',
    path: errorLogDir
});
// Create error log stream
const apiResLogStream = rfs.createStream('response-apis.log', {
    interval: '1d',
    path: errorLogDir
});

const logError = (message) => {
    const timestamp = new Date().toISOString();
    errorLogStream.write(`[${timestamp}] ${message}\n`);
};

const logRes = (message) => {
    const timestamp = new Date().toISOString();
    apiResLogStream.write(`[${timestamp}] ${message}\n`);
};

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
            logError(`Missing piva in row: ${JSON.stringify(row)}`);
            return;
        }
        const promise = limit(() => axiosOpenapi.get(`/IT-closed/${piva}`)
            .then(response => {
                const taxCodeCeased = response.data.data[0]?.taxCodeCeased ? 1 : 0;
                const result = {
                    piva: piva,
                    taxCodeCeased: taxCodeCeased
                };
                logRes(`Response for PIVA ${piva}: ${JSON.stringify(response.data)}`);
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
                    logError(`Invalid PIVA ${piva}: ${error.message}`);
                }
                console.error(`Error processing row: ${JSON.stringify(row)}`, error.status, error.response?.data);
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