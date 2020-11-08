import { APIGatewayProxyHandler } from 'aws-lambda';
import * as allProducts from '../mocks/productList.json';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { id } = event.queryStringParameters;
    const products = (allProducts as any).default;
    const requestedProduct = products.find(product => product.id === id);

    return requestedProduct
           ? {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
        },
        statusCode: 200,
        body: JSON.stringify(requestedProduct),
      }
           : {
        statusCode: 200,
        body: `Product with id = '${ id }' not found`
      }
  } catch (e) {
    return {
      statusCode: 500,
      body: "Internal server error",
      stackTrace: e,
    }
  }
}