import duckdb
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / 'star_cement.duckdb'

def get_db_connection():
    """Get DuckDB connection"""
    return duckdb.connect(str(DB_PATH))

def init_star_schema():
    """Initialize star schema tables"""
    conn = get_db_connection()
    
    # Drop existing tables
    conn.execute("DROP TABLE IF EXISTS fact_production")
    conn.execute("DROP TABLE IF EXISTS fact_energy")
    conn.execute("DROP TABLE IF EXISTS fact_maintenance")
    conn.execute("DROP TABLE IF EXISTS fact_quality")
    conn.execute("DROP TABLE IF EXISTS fact_sales")
    conn.execute("DROP TABLE IF EXISTS fact_finance")
    conn.execute("DROP TABLE IF EXISTS dim_date")
    conn.execute("DROP TABLE IF EXISTS dim_plant")
    
    # Create dimension tables
    conn.execute("""
        CREATE TABLE dim_date (
            date DATE PRIMARY KEY,
            year INTEGER,
            month INTEGER,
            day INTEGER,
            month_name VARCHAR,
            quarter INTEGER
        )
    """)
    
    conn.execute("""
        CREATE TABLE dim_plant (
            plant_id INTEGER PRIMARY KEY,
            plant_name VARCHAR UNIQUE,
            region VARCHAR
        )
    """)
    
    # Create fact tables
    conn.execute("""
        CREATE TABLE fact_production (
            date DATE,
            plant_name VARCHAR,
            line VARCHAR,
            cement_mt DOUBLE,
            clinker_mt DOUBLE,
            capacity_util_pct DOUBLE,
            downtime_hrs DOUBLE
        )
    """)
    
    conn.execute("""
        CREATE TABLE fact_energy (
            date DATE,
            plant_name VARCHAR,
            power_kwh_ton DOUBLE,
            heat_kcal_kg DOUBLE,
            fuel_cost_rs_ton DOUBLE,
            afr_pct DOUBLE
        )
    """)
    
    conn.execute("""
        CREATE TABLE fact_maintenance (
            date DATE,
            plant_name VARCHAR,
            equipment VARCHAR,
            breakdown_hrs DOUBLE,
            mtbf_hrs DOUBLE,
            mttr_hrs DOUBLE
        )
    """)
    
    conn.execute("""
        CREATE TABLE fact_quality (
            date DATE,
            plant_name VARCHAR,
            blaine DOUBLE,
            strength_28d DOUBLE,
            clinker_factor DOUBLE
        )
    """)
    
    conn.execute("""
        CREATE TABLE fact_sales (
            date DATE,
            plant_name VARCHAR,
            region VARCHAR,
            dispatch_mt DOUBLE,
            realization_rs_ton DOUBLE,
            freight_rs_ton DOUBLE,
            otif_pct DOUBLE
        )
    """)
    
    conn.execute("""
        CREATE TABLE fact_finance (
            date DATE,
            plant_name VARCHAR,
            cost_rs_ton DOUBLE,
            ebitda_rs_ton DOUBLE,
            margin_pct DOUBLE
        )
    """)
    
    conn.close()
    print("Star schema initialized successfully")

if __name__ == "__main__":
    init_star_schema()
