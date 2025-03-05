const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
// Use environment variables
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

const client = new CosmosClient({ endpoint, key });

async function main() {
    try {
        const { database } = await client.databases.createIfNotExists({ id: "YourDatabase" });
        const { container } = await database.containers.createIfNotExists({ id: "YourContainer" });
        console.log("Connected to Cosmos DB!");
    } catch (error) {
        console.error("Error connecting to Cosmos DB:", error);
    }
}

main();
