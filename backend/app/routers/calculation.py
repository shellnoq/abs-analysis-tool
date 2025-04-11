# backend/app/routers/calculation.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.input_models import CalculationRequest
from app.models.output_models import CalculationResult, CashFlowSummary
from app.services.calculation_service import perform_calculation, load_excel_data
import pandas as pd
from typing import Dict, Any
import io

router = APIRouter()

# Global variable to store the dataframe after upload
# In a production app, you would use a database or Redis cache instead
df_store = {"df": None}

@router.post("/upload-excel/", response_model=CashFlowSummary)
async def upload_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = load_excel_data(contents)
        
        # Store the dataframe in memory for later use
        df_store["df"] = df
        
        # Return summary data
        return CashFlowSummary(
            total_records=len(df),
            total_principal=float(df['principal_amount'].sum()),
            total_interest=float(df['interest_amount'].sum()),
            total_cash_flow=float(df['cash_flow'].sum()),
            date_range=[df['installment_date'].min().strftime('%d/%m/%Y'), 
                      df['installment_date'].max().strftime('%d/%m/%Y')]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process file: {str(e)}")

@router.post("/calculate/", response_model=CalculationResult)
async def calculate(request: CalculationRequest):
    try:
        # Get the stored dataframe
        df = df_store.get("df")
        if df is None:
            raise HTTPException(status_code=400, detail="No data found. Please upload Excel file first.")
        
        # Perform the calculation
        result = perform_calculation(df, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")