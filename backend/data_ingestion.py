import pandas as pd
from database import get_db_connection
import logging
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)

def ingest_excel_data(sheets_data: Dict[str, pd.DataFrame]) -> bool:
    """Ingest data from Excel sheets into DuckDB star schema"""
    try:
        conn = get_db_connection()
        
        # Populate dim_date
        all_dates = set()
        for df in sheets_data.values():
            if 'Date' in df.columns:
                all_dates.update(df['Date'].dropna().unique())
        
        date_data = []
        for date in all_dates:
            if pd.notna(date):
                dt = pd.to_datetime(date)
                date_data.append({
                    'date': dt.strftime('%Y-%m-%d'),
                    'year': dt.year,
                    'month': dt.month,
                    'day': dt.day,
                    'month_name': dt.strftime('%B'),
                    'quarter': (dt.month - 1) // 3 + 1
                })
        
        if date_data:
            df_dates = pd.DataFrame(date_data)
            conn.execute("DELETE FROM dim_date")
            conn.execute("INSERT INTO dim_date SELECT * FROM df_dates")
            logger.info(f"Inserted {len(date_data)} dates into dim_date")
        
        # Populate dim_plant
        all_plants = set()
        for df in sheets_data.values():
            if 'Plant' in df.columns:
                all_plants.update(df['Plant'].dropna().unique())
        
        plant_data = []
        plant_regions = {
            'Lumshnong': 'Northeast',
            'Sonapur': 'Northeast',
            'Siliguri': 'East',
            'Jalpaiguri': 'East',
            'Guwahati': 'Northeast'
        }
        
        for idx, plant in enumerate(sorted(all_plants), 1):
            plant_data.append({
                'plant_id': idx,
                'plant_name': plant,
                'region': plant_regions.get(plant, 'Unknown')
            })
        
        if plant_data:
            df_plants = pd.DataFrame(plant_data)
            conn.execute("DELETE FROM dim_plant")
            conn.execute("INSERT INTO dim_plant SELECT * FROM df_plants")
            logger.info(f"Inserted {len(plant_data)} plants into dim_plant")
        
        # Populate fact tables
        if 'Production' in sheets_data:
            df = sheets_data['Production'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Cement_MT': 'cement_mt',
                'Clinker_MT': 'clinker_mt',
                'Capacity_Util_%': 'capacity_util_pct',
                'Downtime_Hrs': 'downtime_hrs',
                'Plant': 'plant_name',
                'Line': 'line',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_production")
            conn.execute("INSERT INTO fact_production SELECT date, plant_name, line, cement_mt, clinker_mt, capacity_util_pct, downtime_hrs FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_production")
        
        if 'Energy' in sheets_data:
            df = sheets_data['Energy'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Power_kWh_Ton': 'power_kwh_ton',
                'Heat_kcal_kg': 'heat_kcal_kg',
                'Fuel_Cost_Rs_Ton': 'fuel_cost_rs_ton',
                'AFR_%': 'afr_pct',
                'Plant': 'plant_name',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_energy")
            conn.execute("INSERT INTO fact_energy SELECT date, plant_name, power_kwh_ton, heat_kcal_kg, fuel_cost_rs_ton, afr_pct FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_energy")
        
        if 'Maintenance' in sheets_data:
            df = sheets_data['Maintenance'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Breakdown_Hrs': 'breakdown_hrs',
                'MTBF_Hrs': 'mtbf_hrs',
                'MTTR_Hrs': 'mttr_hrs',
                'Plant': 'plant_name',
                'Equipment': 'equipment',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_maintenance")
            conn.execute("INSERT INTO fact_maintenance SELECT date, plant_name, equipment, breakdown_hrs, mtbf_hrs, mttr_hrs FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_maintenance")
        
        if 'Quality' in sheets_data:
            df = sheets_data['Quality'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Blaine': 'blaine',
                'Strength_28D': 'strength_28d',
                'Clinker_Factor': 'clinker_factor',
                'Plant': 'plant_name',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_quality")
            conn.execute("INSERT INTO fact_quality SELECT date, plant_name, blaine, strength_28d, clinker_factor FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_quality")
        
        if 'Sales_Logistics' in sheets_data:
            df = sheets_data['Sales_Logistics'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Dispatch_MT': 'dispatch_mt',
                'Realization_Rs_Ton': 'realization_rs_ton',
                'Freight_Rs_Ton': 'freight_rs_ton',
                'OTIF_%': 'otif_pct',
                'Plant': 'plant_name',
                'Region': 'region',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_sales")
            conn.execute("INSERT INTO fact_sales SELECT date, plant_name, region, dispatch_mt, realization_rs_ton, freight_rs_ton, otif_pct FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_sales")
        
        if 'Finance' in sheets_data:
            df = sheets_data['Finance'].copy()
            df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
            df = df.rename(columns={
                'Cost_Rs_Ton': 'cost_rs_ton',
                'EBITDA_Rs_Ton': 'ebitda_rs_ton',
                'Margin_%': 'margin_pct',
                'Plant': 'plant_name',
                'Date': 'date'
            })
            conn.execute("DELETE FROM fact_finance")
            conn.execute("INSERT INTO fact_finance SELECT date, plant_name, cost_rs_ton, ebitda_rs_ton, margin_pct FROM df")
            logger.info(f"Inserted {len(df)} rows into fact_finance")
        
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Error ingesting data: {str(e)}")
        raise e
