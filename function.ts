import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts";

// Pull the database connection string from the Deno environment variables
const connectionString = Deno.env.get("CONNECTION_STRING")!;

// Set up a connection pool with a single lazy connection
// TODO: Convert this to use a `Client` if it can be made as brief as a pool
const pool = new postgres.Pool(connectionString, 1, true);

serve(async request => {
  const connection = await pool.connect();
  try {
    const data = await connection.queryObject`SELECT * FROM temperature`;
    console.log(data);
    return new Response("Success: " + JSON.stringify(data.rows), {
      headers: { "content-type": "text/plain" },
    });
  }
  catch (error) {
    return new Response("Error: " + error.message, {
      headers: { "content-type": "text/plain" },
    });
  }
  finally {
    connection.release();
  }
});
