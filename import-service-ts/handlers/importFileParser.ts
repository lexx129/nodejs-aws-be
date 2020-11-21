import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import * as csv from 'csv-parser';
import { BUCKET, INBOUND_DIR, PROCESSED_DIR } from './constants';

export const handler = async (event: S3Event) => {
  console.log('Trigger object: ', event.Records[0].s3.object.key);
  const s3 = new S3({region: 'eu-west-1'});

  for (const record of event.Records) {
    const fileName = record.s3.object.key;
    const params = {
      Bucket: BUCKET,
      Key: fileName
    }

    try {
      s3.getObject(params).createReadStream()
        .pipe(csv())
        .on('data', (data) => {
          console.log('Read some: ', data);
        })
        .on('error', error => console.log('Shit happened: ', error))
        .on('end', () => console.log('Finished reading file'));

      await s3.copyObject({
        Bucket: BUCKET,
        CopySource: `${ BUCKET }/${fileName}`,
        Key: fileName.replace(INBOUND_DIR, PROCESSED_DIR)
      }).promise();

      await s3.deleteObject(params).promise();

      console.log(`Processed file '${fileName}'`);
    // });
    } catch (err) {
      console.log('error while processing fileStream: ', err);
    }
  }
}