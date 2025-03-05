import logging
import azure.functions as func
import json
import os
from azure.cosmos import CosmosClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        # Initialize CosmosDB client
        url = os.environ["COSMOSDB_URI"]
        key = os.environ["COSMOSDB_KEY"]
        client = CosmosClient(url, credential=key)
        
        # Get database and container
        database = client.get_database_client("GuestbookDB")
        container = database.get_container_client("entries")
        
        # Query for all entries, ordered by timestamp (newest first)
        query = "SELECT * FROM c ORDER BY c.timestamp DESC"
        entries = list(container.query_items(query=query, enable_cross_partition_query=True))
        
        # Return the entries as JSON
        return func.HttpResponse(
            json.dumps(entries),
            mimetype="application/json",
            status_code=200
        )
    
    except Exception as e:
        logging.error(f"Error retrieving entries: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
