import 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';

import { handler } from "./importProductsFile";

jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    getSignedUrl: () => 'http://test.url'
  }))
}))

describe('ImportProductsFile handler', () => {
  it('should return signedUrl', async () => {
    const testEvent: any = {
      body: '',
      queryStringParameters: {
        name: 'testImportFile.csv'
      }
    }

    // @ts-ignore
    const result: APIGatewayProxyResult = await handler(testEvent, null, null);
    expect(result.body).toEqual('http://test.url');
  });

  it('should return an error', async () => {
    // @ts-ignore
    const result: APIGatewayProxyResult = await handler(null, null, null);
    expect(result.statusCode).toBe(500);
  })
});