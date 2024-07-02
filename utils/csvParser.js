import csv from 'csv-parser';
import { Readable } from 'stream';

export const parseCsv = (buffer) => {
  const results = [];
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer.toString());
    stream.pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
