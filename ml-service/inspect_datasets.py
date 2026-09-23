import os
import glob
import json
import pandas as pd
import numpy as np

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset_fixed')

def inspect_all():
    files = sorted(glob.glob(os.path.join(DATASET_DIR, '*.csv')))
    inventory = {}

    print(f"Inspecting {len(files)} CSV files in {DATASET_DIR}...\n")

    for fpath in files:
        fname = os.path.basename(fpath)
        try:
            df = pd.read_csv(fpath)
        except Exception as e:
            print(f"Error reading {fname}: {e}")
            continue

        row_count, col_count = df.shape
        cols = list(df.columns)
        dtypes = {col: str(df[col].dtype) for col in cols}
        missing = {col: int(df[col].isnull().sum()) for col in cols}
        dup_count = int(df.duplicated().sum())

        # Check for date columns
        date_cols = []
        date_range = {}
        for col in cols:
            if 'date' in col.lower() or 'month' in col.lower() or 'day' in col.lower() or 'period' in col.lower() or 'year' in col.lower():
                try:
                    dt_series = pd.to_datetime(df[col], errors='coerce')
                    valid_dts = dt_series.dropna()
                    if len(valid_dts) > 0.5 * len(df):
                        date_cols.append(col)
                        date_range[col] = {
                            'min': str(valid_dts.min().date()),
                            'max': str(valid_dts.max().date())
                        }
                except Exception:
                    pass

        # Unique categorical values
        cat_uniques = {}
        for col in cols:
            if df[col].dtype == 'object' and col not in date_cols:
                uniques = [str(x) for x in df[col].dropna().unique()[:10]]
                cat_uniques[col] = {
                    'count': int(df[col].nunique()),
                    'sample': uniques
                }

        # Numerical ranges
        num_ranges = {}
        for col in cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                valid_num = df[col].dropna()
                if len(valid_num) > 0:
                    num_ranges[col] = {
                        'min': float(valid_num.min()),
                        'max': float(valid_num.max()),
                        'mean': float(valid_num.mean()),
                        'std': float(valid_num.std()) if len(valid_num) > 1 else 0.0
                    }

        info = {
            'filename': fname,
            'rowCount': row_count,
            'colCount': col_count,
            'columns': cols,
            'dataTypes': dtypes,
            'dateColumns': date_cols,
            'dateRange': date_range,
            'missingValues': missing,
            'duplicateRecords': dup_count,
            'categoricalSummaries': cat_uniques,
            'numericalRanges': num_ranges
        }
        inventory[fname] = info

        print(f"File: {fname}")
        print(f"  Rows: {row_count}, Cols: {col_count}")
        print(f"  Columns: {cols}")
        if date_range:
            print(f"  Date range: {date_range}")
        print(f"  Duplicates: {dup_count}")
        print(f"  Missing: {sum(missing.values())}")
        print("-" * 60)

    out_path = os.path.join(os.path.dirname(__file__), 'dataset_inventory.json')
    with open(out_path, 'w') as out_f:
        json.dump(inventory, out_f, indent=2)
    print(f"\nSaved inventory to {out_path}")

if __name__ == '__main__':
    inspect_all()
