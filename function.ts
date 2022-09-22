import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts";

const CONNECTION_STRING = Deno.env.get("CONNECTION_STRING")!;
const SECRET = Deno.env.get("SECRET")!;

serve(async request => {
  try {
    const client = new postgres.Client(CONNECTION_STRING);
    await client.connect();
    
    const { secret, temperature } = await request.json();
    
    if (secret !== SECRET) {
      throw new Error('Invalid secret!');
    }
    
    if (isNaN(Number(temperature))) {
      throw new Error('Invalid temperature!');
    }

    const data = await client.queryObject`INSERT INTO temperature(temperature, recorded_at) VALUES (${temperature}, ${new Date()})`;
    console.log(data);
    
    return new Response("Success: " + data.rowCount, {
      headers: { "content-type": "text/plain" },
    });
  }
  catch (error) {
    return new Response("Error: " + error.message, {
      headers: { "content-type": "text/plain" },
    });
  }
  finally {
    await client.end();
  }
});
