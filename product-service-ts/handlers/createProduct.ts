import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

import { connectionOptions } from './helpers';
import { CORS_RESPONSE_HEADERS } from '../constants';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('CreateProduct request: ', event);
  const client = new Client(connectionOptions);
  await client.connect();

  try {
    const { description, flavor, price, count } = JSON.parse(event.body);
    if ([description, flavor, price, count].some(field => field == undefined)){
      return {
        headers: CORS_RESPONSE_HEADERS,
        statusCode: 400,
        body: "Product data is incorrect"
      }
    }

    const createProductResult = await client.query(`
      insert into products (description, flavor, price) values
        ('${description}', '${flavor}', ${price})
      returning id
    `);

    const createdId = createProductResult.rows[0].id;
    await client.query(`
      insert into stocks (product_id, count) values
        ('${createdId}', ${count})
    `);

    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 200,
      body: `Created product with id=${ createdId }`,
    }
  } catch (e) {
    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 500,
      body: "Internal server error",
      stackTrace: e,
    }
  } finally {
    client.end();
  }
}