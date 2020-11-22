import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

import { connectionOptions } from './helpers';
import { CORS_RESPONSE_HEADERS } from '../../shared/constants';
import { addProductToDB } from '../../shared/utils';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('CreateProduct request: ', event);
  const client = new Client(connectionOptions);
  await client.connect();

  try {
    const { description, flavor, price, count } = JSON.parse(event.body);

    addProductToDB(client, { description, flavor, count, price })
      .then(createdId => {
        return {
          headers: CORS_RESPONSE_HEADERS,
          statusCode: 201,
          body: `Created product with id=${ createdId }`,
        }
      })
      .catch(_ => {
        return {
          headers: CORS_RESPONSE_HEADERS,
          statusCode: 400,
          body: "Product data is incorrect"
        }
      })

  } catch (e) {
    console.log('Error happened while creating a product', e);
    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 500,
      body: "Internal server error",
    }
  } finally {
    client.end();
  }
}