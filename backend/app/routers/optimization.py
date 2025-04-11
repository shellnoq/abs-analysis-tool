# backend/app/routers/optimization.py
import time
from fastapi.responses import JSONResponse
from fastapi import APIRouter, HTTPException, Path
from app.models.input_models import OptimizationSettings, GeneralSettings
from app.models.output_models import OptimizationResult

# Import the optimization_progress object and all optimization functions
from app.services.optimization_service import (
    optimization_progress,  # Import the progress tracker
    perform_optimization, 
    perform_gradient_optimization,
    perform_bayesian_optimization,
    perform_genetic_optimization
)
from app.routers.calculation import df_store  # Import the shared dataframe store

router = APIRouter()

@router.get("/optimize/progress/", response_model=dict)
async def get_optimization_progress():
    """Get the current progress of an ongoing optimization process"""
    try:
        # Add a small delay to reduce server load (10ms)
        time.sleep(0.01)
        
        # Get the current progress information
        progress_info = optimization_progress.get_info()
        
        # Force the progress to be a valid number between 0-100
        progress_info['progress'] = max(0, min(100, progress_info['progress']))
        
        # Ensure the message is not None
        if progress_info['message'] is None:
            progress_info['message'] = "Processing..."
            
        # Ensure the phase is not None
        if progress_info['phase'] is None:
            progress_info['phase'] = "Processing"
        
        # Add a timestamp for debugging
        progress_info['timestamp'] = time.time()
        
        return JSONResponse(content=progress_info)
    except Exception as e:
        # Return an error status that the frontend can handle
        error_response = {
            "error": True,
            "message": f"Error retrieving optimization progress: {str(e)}",
            "progress": 0,
            "phase": "Error",
            "timestamp": time.time()
        }
        return JSONResponse(content=error_response, status_code=200) # Still return 200 for easier frontend handling
    
@router.post("/optimize/classic/", response_model=OptimizationResult)
async def optimize_classic(
    optimization_settings: OptimizationSettings,
    general_settings: GeneralSettings
):
    try:
        # Get the stored dataframe
        df = df_store.get("df")
        if df is None:
            raise HTTPException(status_code=400, detail="No data found. Please upload Excel file first.")
        
        # Perform the optimization with classic method
        result = perform_optimization(df, general_settings, optimization_settings)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Classic optimization error: {str(e)}")

@router.post("/optimize/gradient/", response_model=OptimizationResult)
async def optimize_gradient(
    optimization_settings: OptimizationSettings,
    general_settings: GeneralSettings
):
    try:
        df = df_store.get("df")
        if df is None:
            raise HTTPException(status_code=400, detail="No data found. Please upload Excel file first.")
        
        result = perform_gradient_optimization(df, general_settings, optimization_settings)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gradient optimization error: {str(e)}")

@router.post("/optimize/bayesian/", response_model=OptimizationResult)
async def optimize_bayesian(
    optimization_settings: OptimizationSettings,
    general_settings: GeneralSettings
):
    try:
        df = df_store.get("df")
        if df is None:
            raise HTTPException(status_code=400, detail="No data found. Please upload Excel file first.")
        
        result = perform_bayesian_optimization(df, general_settings, optimization_settings)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bayesian optimization error: {str(e)}")

@router.post("/optimize/genetic/", response_model=OptimizationResult)
async def optimize_genetic(
    optimization_settings: OptimizationSettings,
    general_settings: GeneralSettings
):
    try:
        df = df_store.get("df")
        if df is None:
            raise HTTPException(status_code=400, detail="No data found. Please upload Excel file first.")
        
        result = perform_genetic_optimization(df, general_settings, optimization_settings)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Genetic optimization error: {str(e)}")

# Backward compatibility için ana endpoint
@router.post("/optimize/", response_model=OptimizationResult)
async def optimize(
    optimization_settings: OptimizationSettings,
    general_settings: GeneralSettings
):
    method = getattr(optimization_settings, "optimization_method", "classic")
    if method == "classic":
        return await optimize_classic(optimization_settings, general_settings)
    elif method == "gradient":
        return await optimize_gradient(optimization_settings, general_settings)
    elif method == "bayesian":
        return await optimize_bayesian(optimization_settings, general_settings)
    elif method == "genetic":
        return await optimize_genetic(optimization_settings, general_settings)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown optimization method: {method}")