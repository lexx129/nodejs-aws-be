import { APIGatewayProxyHandler } from 'aws-lambda';
import * as allProducts from '../mocks/productList.json';

export const handler: APIGatewayProxyHandler = async () => {
  const products = (allProducts as any).default;
  try {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
      },
      statusCode: 200,
      body: JSON.stringify(products),
    }
  } catch (e) {
    return  {
      statusCode: 500,
      body: "Internal server error",
      stackTrace: e,
    }
  }
}