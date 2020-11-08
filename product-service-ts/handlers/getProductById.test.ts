import { describe, expect, it } from '@jest/globals';
import { handler } from './getProductById';
import { APIGatewayProxyResult } from 'aws-lambda';

describe('GetProductByIdHandler', () => {
  beforeEach(() => {
    jest.mock('products', () => ([
      {
        id: '123'
      }
    ]), {virtual: true});
  });

  it('should return existing product', () => {
    const testEvent = {
      queryStringParameters: {
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa"
      }
    };
    const expected = {
      statusCode: 200,
      body: JSON.stringify({
        "count": 4,
        "description": "Protein Cookie",
        "flavor": "Coconut",
        "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        "price": 90
      })
    };

    // @ts-ignore
    const request: Promise<APIGatewayProxyResult> =  handler(testEvent as any, null, null);
    request.then(data => {
      expect(data).toEqual(expected);
    })
  });

  it('should return a "Not found" error', () => {
    const testEvent = {
      queryStringParameters: {
        id: "id-not-exist"
      }
    };
    const expected = {
      statusCode: 200,
      body: `Product with id = 'id-not-exist' not found`
    };

    // @ts-ignore
    const request: Promise<APIGatewayProxyResult> =  handler(testEvent as any, null, null);
    request.then(data => {
      expect(data).toEqual(expected);
    })
  })
})