
import { Pool } from 'pg';
require('dotenv').config()
console.log(process.env.POSTGRES_PASSWORD)
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ecommerce_db',
  password:process.env.POSTGRES_PASSWORD ,
  port: 5432,
});

// export const clientAsPromise=pool.connect()