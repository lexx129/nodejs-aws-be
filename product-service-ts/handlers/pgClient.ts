import { Client } from 'pg';
import { connectionOptions } from './helpers';

export const init = async () => {
  const client = new Client(connectionOptions);
  await client.connect();

  try {
    await client.query(`create extension if not exists "uuid-ossp"`);
    await client.query(`
      create table if not exists products(
        id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER
      )
    `);
    await client.query(`
      create table if not exists stocks(
        product_id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        count integer,
        foreign key (product_id) references products (id)
      )
    `);
    await client.query(`
      insert into products (description, flavor, price) values 
        ('Protein Cookie', 'Coconut', 90),
        ('Protein Cookie', 'Apple', 100),
        ('Protein Cookie', 'Wildberry', 90),
        ('Protein Bar', 'Almond', 120),
        ('Protein Bar', 'Banana', 120),
        ('Protein Bar', 'Chocolate', 130),
        ('Protein Bar', 'Coconut', 150)
    `);
    await client.query(`
      insert into stocks (product_id, count) values 
        ('a35c018a-091e-48d7-b1e3-d6ef9cb6c589', 4),
        ('e65d101a-e443-48d2-b642-8358951661ad', 6),
        ('5eceb3a6-5507-4aa8-a33f-dc7c5a849780', 7),
        ('9fbeb37c-6e4f-4ea8-b631-a1cddd8f55a6', 12),
        ('562c65f8-c8ce-4c18-a759-58d05372069a', 7),
        ('0d1d4187-536c-47d1-b44e-901ec90fdf77', 10),
        ('7a2a350d-d1c9-4d08-a031-93b6769f0f67', 150)
    `)
  } catch (err) {
    console.warn('Err during db initialisation: ', err);
  } finally {
    client.end();
  }
}
