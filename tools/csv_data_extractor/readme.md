# Birra Data Extractor

This script extracts data from multiple Birra CSV files (one per year) and combines them into a single CSV file with columns: date, CFC, JCR, JSP, DMP, DSS.

## Usage

Run the script from the directory containing the Birra CSV files:

```bash
python3 tools/csv_data_extractor/extract_birra_data.py
```

This will generate `combined_birra_data.csv` in the current directory.

## Requirements

- Python 3
- CSV files named "Birra - YYYY.csv" in the parent directory

## Output

The output CSV has the following format:
- date: YYYY-MM-DD
- CFC, JCR, JSP, DMP, DSS: scores for each player, '0' if missing
