import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

import { connectionOptions } from './helpers';
import { CORS_RESPONSE_HEADERS } from '../../shared/constants';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('GetAllProducts request: ', event)
  const client = new Client(connectionOptions);
  await client.connect();
  try {
    const productsWithStocks = await client.query(`
      select products.*, stocks.count from products
      join stocks on products.id = stocks.product_id
    `);
    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 200,
      body: JSON.stringify(productsWithStocks.rows),
    }
  } catch (e) {
    return  {
      statusCode: 500,
      body: "Internal server error",
      stackTrace: e,
    }
  } finally {
    client.end();
  }
}