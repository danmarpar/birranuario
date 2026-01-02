#!/usr/bin/env python3
"""
Script to extract data from Birra CSV files and combine into a single CSV.
"""

import csv
import os
import re

# Month mapping
MONTH_MAP = {
    'ene': '01',
    'feb': '02',
    'mar': '03',
    'abr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'ago': '08',
    'sept': '09',
    'oct': '10',
    'nov': '11',
    'dic': '12'
}

def extract_data_from_csvs(directory):
    data = []
    # Find all Birra - YYYY.csv files
    for file in os.listdir(directory):
        if file.startswith('Birra - ') and file.endswith('.csv'):
            year_match = re.search(r'(\d{4})', file)
            if year_match:
                year = year_match.group(1)
                filepath = os.path.join(directory, file)
                print(f"Processing {file} for year {year}")
                with open(filepath, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    for row_num, row in enumerate(reader):
                        if row_num < 3:  # Skip header rows
                            continue
                        if not row or all(not field.strip() for field in row):
                            continue
                        i = 0
                        while i < len(row):
                            field = row[i].strip()
                            if re.match(r'\d+-\w+', field):
                                date_str = field
                                parts = date_str.split('-')
                                if len(parts) == 2:
                                    day, month_str = parts
                                    if month_str in MONTH_MAP:
                                        month = MONTH_MAP[month_str]
                                        day = day.zfill(2)
                                        full_date = f"{year}-{month}-{day}"
                                        # Skip amount (i+1)
                                        i += 2
                                        scores = []
                                        for j in range(5):  # CFC, JCR, JSP, DMP, DSS
                                            if i < len(row):
                                                score = row[i].strip()
                                                scores.append(score if score else '0')
                                                i += 1
                                            else:
                                                scores.append('0')
                                        data.append([full_date] + scores)
                                    else:
                                        i += 1
                                else:
                                    i += 1
                            else:
                                i += 1
    return data

def main():
    # Assume run from birranuario directory
    directory = '.'
    data = extract_data_from_csvs(directory)
    # Sort by date
    data.sort(key=lambda x: x[0])
    # Write to combined CSV
    output_file = 'combined_birra_data.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['date', 'CFC', 'JCR', 'JSP', 'DMP', 'DSS'])
        for row in data:
            writer.writerow(row)
    print(f"Combined data written to {output_file}")

if __name__ == '__main__':
    main()
