export interface Product {
  description: string;
  flavor: string;
  price: number;
  count: number;
}

export const addProductToDB =  (dbClient: any, product: Product): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const { description, flavor, price, count } = product;

    if ([description, flavor, price, count].some(field => field == undefined)){
      console.log("Product data is incorrect");
      reject("Product data is incorrect");
    }

    try {
      const createProductResult = await dbClient.query(
        'insert into products (description, flavor, price) values ($1, $2, $3) returning id',
        [description, flavor, price]
      );

      const createdId = createProductResult.rows[0].id;
      await dbClient.query(
        'insert into stocks (product_id, count) values ($1, $2)',
        [createdId, count]
      );

      resolve(createdId);
    } catch (err){
      console.log('Error while adding product to DB: ', err);
      reject(err);
    }
  })
}