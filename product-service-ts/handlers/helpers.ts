const { URL, PORT, DBNAME, USER, PASSWORD } = process.env;

export const connectionOptions = {
  host: URL,
  port: PORT,
  database: DBNAME,
  user: USER,
  password: PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
};