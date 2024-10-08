import express from "express";
import pg from "pg";
import { Connector } from "@google-cloud/cloud-sql-connector";
const DEFAULT_TIMEOUT = 60 * 60 * 1000; // in ms
const { Pool } = pg;

const connector = new Connector();
const clientOpts = await connector.getOptions({
  instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
  authType: "IAM",
});

const pool = new Pool({
  ...clientOpts,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

const app = express();

app.get("/", async (req, res) => {
  await pool.query("INSERT INTO visits(created_at) VALUES(NOW())");
  const { rows } = await pool.query(
    "SELECT created_at FROM visits ORDER BY created_at DESC LIMIT 5"
  );
  console.table(rows);
  res.send(rows);
});

const port = parseInt(process.env.PORT) || 8080;
const server = app.listen(port, async () => {
  console.log("process.env: ", process.env);

  await pool.query(`CREATE TABLE IF NOT EXISTS visits (
    id SERIAL NOT NULL,
    created_at timestamp NOT NULL,
    PRIMARY KEY (id)
  );`);
  console.log(`helloworld: listening on port ${port}`);
});

server.setTimeout(500000);
