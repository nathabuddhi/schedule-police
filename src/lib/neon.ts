import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function getData() {
    const sql = neon(process.env.DATABASE_URL ?? "a");
    const response = await sql`SELECT version()`;
    return response[0].version;
}

export default async function Page() {
    const data = await getData();
    console.log(data);
}

Page();
