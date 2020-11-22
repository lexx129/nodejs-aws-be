import { S3Event } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import * as csv from 'csv-parser';
import { BUCKET, INBOUND_DIR, PROCESSED_DIR } from './constants';
import { CORS_RESPONSE_HEADERS } from '../../shared/constants';

const parseImportedFile = (fileName: string, s3Instance: S3): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const params = {
      Bucket: BUCKET,
      Key: fileName
    }

    try {
      s3Instance.getObject(params).createReadStream()
        .pipe(csv({
          mapValues: (
            { header, index, value }
          ) => {
            if (header === 'count' || header === 'price') {
              return Number(value)
            }
            return value;
          }
        }))
        .on('data', (data) => {
          console.log('Read some: ', data);
          const sqs = new SQS();

          sqs.sendMessage({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(data),
          }, (err, data) => {
            if (err) {
              console.log('Error happened: ', err);
              reject();
            } else {
              console.log(`Sent message with '${ JSON.stringify(data) }' to the queue`);
            }
          });
        })
        .on('error', error => {
          reject(`Shit happened: ${ error }`);
        })
        .on('end', () => {
          console.log(`Processed file '${ fileName }'`);
          resolve();
        });
    } catch (error) {
      reject(`Error while processing uploaded file: ${ error }`);
    }
  });
}

const moveParsedFile = (fileName: string, s3Instance: S3): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        Bucket: BUCKET,
        Key: fileName
      }

      await s3Instance.copyObject({
        Bucket: BUCKET,
        CopySource: `${ BUCKET }/${ fileName }`,
        Key: fileName.replace(INBOUND_DIR, PROCESSED_DIR)
      }).promise();

      await s3Instance.deleteObject(params).promise();
      resolve();
    } catch (error) {
      reject(`Error while moving files: ${ error }`);
    }
  })
}


export const handler = async (event: S3Event, _, callback) => {
  console.log('Trigger object: ', event.Records[0].s3.object.key);
  const s3 = new S3({ region: 'eu-west-1' });
  try {
    for (const record of event.Records) {
      const fileName = record.s3.object.key;
      console.log('Now processing file: ', fileName);

      await parseImportedFile(fileName, s3);
      await moveParsedFile(fileName, s3);
    }
    callback(null, {
      status: 200,
      headers: CORS_RESPONSE_HEADERS,
      body: 'All files were processed',
    });
  } catch (error) {
    console.log(error);
  }
}

