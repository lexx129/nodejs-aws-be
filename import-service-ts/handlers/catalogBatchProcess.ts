import { Client } from 'pg';

import { connectionOptions } from '../../product-service-ts/handlers/helpers';
import { addProductToDB, Product } from '../../shared/utils';
import { SNS } from 'aws-sdk';

export const handler = async (event) => {
  console.log('Queue handler got an event: ', event);

  const client = new Client(connectionOptions);
  await client.connect();

  try {
    const promises = event.Records.map(async record => {
      const product: Product = JSON.parse(record.body);
      console.log('gonna create product: ', product);

      return await addProductToDB(client, product);
    });
    const results = await Promise.all(promises);

    for (const result of results) {
      const sns = new SNS({ region: 'eu-west-1' });
      await sns.publish({
        Subject: 'Product creation notification',
        Message: `Product with id = '${result}' was created`,
        TopicArn: process.env.SNS_ARN,
      }, (err, data) => {
        if (err){
          console.log('error while sending email notification', err);
        } else {
          console.log('sent notification for product', data);
        }
      }).promise();
      console.log('Created product with id: ', result);
    }
  } catch (error) {
    console.log('Error while creating product: ', error);
  } finally {
    client.end();
  }
}

