# backend/app/models/input_models.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class GeneralSettings(BaseModel):
    start_date: date
    operational_expenses: float
    min_buffer: float

class TrancheA(BaseModel):
    maturity_days: int
    base_rate: float
    spread: float
    reinvest_rate: float
    nominal: float

class TrancheB(BaseModel):
    maturity_days: int
    base_rate: float
    spread: float
    reinvest_rate: float

class NPVSettings(BaseModel):
    method: str  # "weighted_avg_rate" or "custom_rate"
    custom_rate: Optional[float] = None

class OptimizationSettings(BaseModel):
    optimization_method: str = Field(default="classic")
    a_tranches_range: List[int] = Field(default=[2, 6])
    maturity_range: List[int] = Field(default=[32, 365])
    maturity_step: int = Field(default=10)
    min_class_b_percent: float = Field(default=10.0)
    target_class_b_coupon_rate: float = Field(default=30.0)
    additional_days_for_class_b: int = Field(default=10)
    
    # Gradient descent için
    learning_rate: Optional[float] = Field(default=0.01)
    max_iterations: Optional[int] = Field(default=100)
    
    # Genetik algoritma için
    population_size: Optional[int] = Field(default=50)
    num_generations: Optional[int] = Field(default=40)
    
    # Bayesian için
    n_calls: Optional[int] = Field(default=50)
    n_initial_points: Optional[int] = Field(default=10)

class CalculationRequest(BaseModel):
    general_settings: GeneralSettings
    tranches_a: List[TrancheA]
    tranche_b: TrancheB
    npv_settings: NPVSettings