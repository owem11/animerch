# Utility Scripts

This directory contains utility scripts for database management, data migration, and testing.

## Scripts

### Data Migration
- `migrate-legacy-options.ts` - Migrates legacy product options to new schema
- `migrate-prices.ts` - Updates product pricing structure
- `upgrade-inventory.ts` - Upgrades inventory data format

### Data Management
- `clean-inventory-data.ts` - Cleans and validates inventory data
- `deduplicate-products.ts` - Removes duplicate product entries
- `populate-costs.ts` - Populates missing cost price data
- `boost-ratings.ts` - Utility for managing product ratings

### Data Generation
- `generate-sales.ts` - Generates sample sales data for testing
- `convert-json-to-string.ts` - Converts JSON data to string format

## Usage

Most scripts can be run using:
```bash
npx tsx scripts/<script-name>.ts
```

Or from the API directory:
```bash
cd apps/api
npx tsx ../../scripts/<script-name>.ts
```

## Note

These are utility scripts and should be run with caution in production environments. Always backup your database before running migration scripts.
