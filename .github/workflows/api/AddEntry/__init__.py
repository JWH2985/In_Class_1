import logging
import azure.functions as func
import json
import os
import uuid
from datetime import datetime
from azure.cosmos import CosmosClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request to add entry.')

    try:
        # Get request body
        req_body = req.get_json()
        
        # Check if name and message are provided
        if not req_body or 'name' not in req_body or 'message' not in req_body:
            return func.HttpResponse(
                json.dumps({"error": "Please provide both name and message"}),
                mimetype="application/json",
                status_code=400
            )
        
        # Initialize CosmosDB client
        url = os.environ["COSMOSDB_URI"]
        key = os.environ["COSMOSDB_KEY"]
        client = CosmosClient(url, credential=key)
        
        # Get database and container
        database = client.get_database_client("GuestbookDB")
        container = database.get_container_client("entries")
        
        # Create new entry
        new_entry = {
            "id": str(uuid.uuid4()),
            "name": req_body.get("name"),
            "message": req_body.get("message"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add entry to CosmosDB
        container.create_item(new_entry)
        
        # Return success response
        return func.HttpResponse(
            json.dumps({"success": True, "entry": new_entry}),
            mimetype="application/json",
            status_code=201
        )
    
    except Exception as e:
        logging.error(f"Error adding entry: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
