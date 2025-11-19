# API Documentation

This directory contains the OpenAPI/Swagger specification for the Fore Coffee Year Recap API.

## Files

- `openapi.yaml` - OpenAPI 3.0.3 specification file

## Viewing the Documentation

### Option 1: Swagger UI (Online)

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `openapi.yaml`
3. Paste into the editor to view interactive documentation

### Option 2: Swagger UI (Local)

Install Swagger UI locally:

```bash
npm install -g swagger-ui-serve
swagger-ui-serve docs/api/openapi.yaml
```

Then open http://localhost:3000 in your browser.

### Option 3: Redoc

Install Redoc CLI:

```bash
npm install -g redoc-cli
redoc-cli serve docs/api/openapi.yaml
```

### Option 4: VS Code Extension

Install the "OpenAPI (Swagger) Editor" extension in VS Code to view and edit the specification.

## API Endpoint

The main endpoint documented is:

- `GET /api/user-data` - Retrieves user year recap data

## Authentication

In production, requests must include:

- **Header**: `timestamp` (ISO 8601 format)
- **Header**: `user_id` (integer)
- **Header**: `sign` = `base64(timestamp + user_id)` (if the backend sets `AUTH_SIGNATURE_SECRET`, append it between timestamp and user_id before encoding)

Alternatively, these can be passed as query parameters for client-side usage.

## Example Request

```bash
curl -X GET "https://api.forecoffee.com/v1/api/user-data" \
  -H "timestamp: 2025-11-10T20:00:00.000Z" \
  -H "user_id: 12345" \
  -H "sign: MjAyNS0xMS0xMFQyMDowMDowMC4wMDBaMTIzNDU="
```

## Example Response

```json
{
  "userName": "John Doe",
  "trxCount": 100,
  "variantCount": 8,
  "listProductFavorite": [
    {
      "productName": "Espresso",
      "countCups": 25,
      "productImage": "https://example.com/images/espresso.jpg"
    }
  ],
  "totalPoint": 1250,
  "totalPointDescription": "Poin itu bisa kamu tukarkan dengan 25 cup Butterscotch Sea Salt Latte di FOREwards lho!",
  "totalPointPossibleRedeem": 25,
  "totalPointImage": "https://example.com/images/latte.jpg",
  "deliveryCount": 45,
  "pickupCount": 55,
  "cheaperSubsDesc": "325rb Rupiah",
  "cheaperSubsAmount": 325500,
  "topRanking": 50,
  "listCircularImages": [
    "https://example.com/images/circle1.jpg"
  ],
  "listFavoriteStore": [
    {
      "storeName": "Fore Coffee Grand Indonesia",
      "transactionCount": 30,
      "storeImage": "https://example.com/images/store1.jpg"
    }
  ]
}
```

## Generating Client Code

You can generate client code from the OpenAPI specification using tools like:

- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)

Example:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o src/generated/api-client
```

## Updating the Specification

When updating the API contract:

1. Update `openapi.yaml` with new endpoints, schemas, or parameters
2. Update `src/types/server.ts` to match the schema
3. Update this README if needed
4. Regenerate client code if using code generation

## Validation

Validate the OpenAPI specification:

```bash
# Using swagger-cli
npm install -g swagger-cli
swagger-cli validate docs/api/openapi.yaml

# Or using online validator
# https://validator.swagger.io/
```

