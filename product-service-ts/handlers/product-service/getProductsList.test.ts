import * as products from '../../mocks/productList.json';
import { handler } from './getProductsList';

describe('GetProductsListHandler', () => {
  it('should return all products', () => {
    // @ts-ignore
    const request: Promise<any> = handler(null, null, null);
    request.then(data => {
      expect(JSON.parse(data)).toEqual(products);
    })
  })
})