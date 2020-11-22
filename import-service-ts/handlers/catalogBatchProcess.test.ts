import { v4 } from 'uuid';
import 'pg';
import 'aws-sdk';
import { handler } from './catalogBatchProcess';

const mockPublish = jest.fn(() => ({
  promise: jest.fn(() => Promise.resolve())
}));
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    getSignedUrl: () => 'http://test.url'
  })),
  SNS: jest.fn().mockImplementation(() => ({
    publish: mockPublish
  }))
}));

const mockConnect = jest.fn(() => Promise.resolve());
const mockQuery = jest.fn(() => Promise.resolve({
  rows: [
    {
      id: v4(),
    },
  ],
}));
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    connect: mockConnect,
    end: jest.fn(),
  }))
}))

describe('CatalogBatchProcess', () => {
  const testEvent = {
    Records: [
      {
        body: '{"description":"Product 51","flavor":"ice-cream","count":15,"price":110}',
      },
      {
        body: '{"description":"Product 55","flavor":"apple","count":8,"price":150}',
      }
    ]
  }
  it('should add product to db', async () => {
    await handler(testEvent);
    expect(mockConnect).toHaveBeenCalled();
    await expect(mockQuery).toHaveBeenCalledTimes(4);
    await expect(mockPublish).toHaveBeenCalledTimes(2);
  })
})