import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts";

// Pull the database connection string from the Deno environment variables
const CONNECTION_STRING = Deno.env.get("CONNECTION_STRING")!;

// Pull the authorization secret from the Deno environment variables
const SECRET = Deno.env.get("SECRET")!;

// Set up a connection pool with a single lazy connection
// TODO: Convert this to use a `Client` if it can be made as brief as a pool
const pool = new postgres.Pool(CONNECTION_STRING, 1, true);

serve(async request => {
  const connection = await pool.connect();
  try {
    // Parse out the temperature value and the secret to authorize the caller
    const { secret, temperature } = await request.json();
    if (secret !== SECRET) {
      throw new Error('Invalid secret!');
    }
    
    if (isNaN(Number(temperature))) {
      throw new Error('Invalid temperature!');
    }
    
    const query = 'INSERT INTO temperature(temperature, recorded_at) VALUES ($TEMPERATURE, $STAMP)';
    const stamp = new Date();
    console.log({ query, temperature, stamp });
    const data = await connection.queryObject({ text: query, args: { temperature, stamp } });
    console.log(data);
    
    return new Response("Success: " + data.rowCount + " rows", {
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
