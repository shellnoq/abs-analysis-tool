# backend/app/services/calculation_service.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.models.input_models import CalculationRequest
from app.models.output_models import CalculationResult
from app.utils.finance_utils import (
    simple_to_compound_annual, 
    simple_to_maturity_compound, 
    overnight_to_annual_compound,
    get_next_business_day,
    calculate_reinvestment_date
)
from app.utils.cash_flow_utils import (
    assign_cash_flows_to_tranches,
    calculate_totals
)
from typing import Dict, List, Any, Tuple
import io

def load_excel_data(contents: bytes) -> pd.DataFrame:
    """Load and preprocess Excel data"""
    try:
        df = pd.read_excel(io.BytesIO(contents))
        df.rename(columns={'Copyinstallment_date': 'installment_date'}, inplace=True, errors='ignore')
        df['installment_date'] = pd.to_datetime(df['installment_date'], dayfirst=True, errors='coerce')
        
        if 'principal_amount' not in df.columns or 'interest_amount' not in df.columns:
            raise ValueError("The Excel file does not contain 'principal_amount' or 'interest_amount' columns.")
        
        df['cash_flow'] = df['principal_amount'] + df['interest_amount']
        # Save original cash flows
        df['original_cash_flow'] = df['cash_flow'].copy()
        
        return df
    except Exception as e:
        raise ValueError(f"Error processing Excel file: {str(e)}")

def perform_calculation(df: pd.DataFrame, request: CalculationRequest) -> CalculationResult:
    """Perform ABS calculation based on provided parameters"""
    # Extract request parameters
    start_date = pd.Timestamp(request.general_settings.start_date)
    ops_expenses = request.general_settings.operational_expenses
    min_buffer = request.general_settings.min_buffer
    
    # Apply operational expenses
    df_calc = df.copy()
    df_calc['cash_flow'] = df_calc['original_cash_flow'].copy()
    target_date = pd.Timestamp('2025-02-16')
    target_rows = df_calc[df_calc['installment_date'].dt.date == target_date.date()]
    
    if not target_rows.empty:
        t_idx = target_rows.index[0]
        orig_cf = df_calc.at[t_idx, 'cash_flow']
        new_cf = max(0, orig_cf - ops_expenses)
        df_calc.at[t_idx, 'cash_flow'] = new_cf
    
    # Extract tranche parameters
    a_maturity_days = [t.maturity_days for t in request.tranches_a]
    a_base_rates = [t.base_rate for t in request.tranches_a]
    a_spreads = [t.spread for t in request.tranches_a]
    a_reinvest_rates = [t.reinvest_rate for t in request.tranches_a]
    a_nominal_amounts = [t.nominal for t in request.tranches_a]
    
    b_maturity_days = [request.tranche_b.maturity_days]
    b_base_rates = [request.tranche_b.base_rate]
    b_spreads = [request.tranche_b.spread]
    b_reinvest_rates = [request.tranche_b.reinvest_rate]
    
    # Calculate B nominal amount
    total_a_nominal = sum(a_nominal_amounts)
    percent_b = 10.17811704
    b_nominal_amount = (total_a_nominal * percent_b) / (100 - percent_b)
    b_nominal_amount = round(b_nominal_amount / 1000) * 1000
    b_nominal = [b_nominal_amount]
    
    # Combine all parameters
    all_maturity_days = a_maturity_days + b_maturity_days
    all_base_rates = a_base_rates + b_base_rates
    all_spreads = a_spreads + b_spreads
    all_reinvest_rates = a_reinvest_rates + b_reinvest_rates
    all_nominal = a_nominal_amounts + b_nominal
    
    # Calculate maturity dates
    all_maturity_dates = [start_date + pd.Timedelta(days=days) for days in all_maturity_days]
    
    # Distribute cash flows into tranches
    tranch_cash_flows = assign_cash_flows_to_tranches(
        df_calc, start_date, all_maturity_dates, all_reinvest_rates
    )
    
    # Calculate results for each tranche
    results = []
    buffer = 0.0
    interest_rate_conversions = []
    
    for i in range(len(all_maturity_days)):
        is_class_a = (i < len(a_maturity_days))
        
        # Set tranche name
        if is_class_a:
            t_name = f"Class A{i+1}"
        else:
            t_name = f"Class B{i - len(a_maturity_days) + 1}"
        
        # Calculate cash flow totals
        c_flow, r_return, total_principal, total_interest = calculate_totals(
            tranch_cash_flows[i], all_maturity_dates[i], all_reinvest_rates[i]
        )
        
        # Buffer reinvestment calculation
        if i > 0 and buffer > 0:
            dd = all_maturity_days[i] - all_maturity_days[i-1]
            if dd > 0:
                factor = (1 + simple_to_compound_annual(all_reinvest_rates[i])/100)**(dd/365) - 1
                buffer_reinv = buffer * factor
            else:
                buffer_reinv = 0
        else:
            buffer_reinv = 0
        
        # Total available funds
        total_available = c_flow + r_return + buffer + buffer_reinv
        
        # Interest rate calculations
        base_rate_val = all_base_rates[i]
        spread_bps = all_spreads[i]
        total_rate = base_rate_val + (spread_bps/100.0)
        
        if is_class_a:
            # Class A payment logic
            nominal_pmt = all_nominal[i]
            
            discount_factor = 1 / (1 + (total_rate/100 * all_maturity_days[i]/365)) if all_maturity_days[i] > 0 else 1
            principal = nominal_pmt * discount_factor
            interest = nominal_pmt - principal
            coupon_payment = 0
            coupon_rate = 0.0
            
            total_payment = nominal_pmt
        else:
            # Class B payment logic
            nominal_pmt = all_nominal[i]
            principal = nominal_pmt
            coupon_payment = max(0, total_available - principal)
            interest = 0
            coupon_rate = (coupon_payment / principal * 100) if principal > 0 else 0.0
            discount_factor = 1.0
            
            total_payment = principal + coupon_payment
        
        # Calculate buffer
        new_buffer = max(0, total_available - total_payment)
        buffer_cf_ratio = (new_buffer / nominal_pmt * 100) if nominal_pmt != 0 else 0
        
        # Calculate effective interest rates
        if is_class_a:
            final_simple = total_rate
            total_interest_rate_percent = total_rate
            effective_coupon_rate = 0.0
        else:
            final_simple = coupon_rate
            total_interest_rate_percent = 0.0
            effective_coupon_rate = (coupon_payment / principal) * (365 / all_maturity_days[i]) * 100 if principal > 0 and all_maturity_days[i] > 0 else 0.0
        
        # Interest rate conversions
        if is_class_a:
            comp_period = simple_to_maturity_compound(final_simple, all_maturity_days[i])
            simple_annual_display = final_simple
            compound_period_display = comp_period
        else:
            # For Class B, use dash ("-") for these values
            simple_annual_display = "-"
            compound_period_display = "-"
        
        reinvest_on_comp = overnight_to_annual_compound(all_reinvest_rates[i])
        
        interest_rate_conversions.append({
            "Tranche": t_name,
            "Maturity Days": all_maturity_days[i],
            "Simple Annual Interest (%)": simple_annual_display,
            "Compound Interest for Period (%)": compound_period_display,
            "Reinvest Simple Annual (%)": all_reinvest_rates[i],
            "Reinvest O/N Compound (%)": reinvest_on_comp,
            "Coupon Rate (%)": coupon_rate if not is_class_a else 0.0,
            "Effective Coupon Rate (%)": effective_coupon_rate if not is_class_a else 0.0
        })
        
        # Add to results
        results.append({
            "Tranche": t_name,
            "Start Date": start_date.strftime("%d/%m/%Y"),
            "Maturity Days": all_maturity_days[i],
            "Maturity Date": all_maturity_dates[i].strftime("%d/%m/%Y"),
            "Base Rate (%)": base_rate_val,
            "Spread (bps)": spread_bps,
            "Total Interest Rate (%)": total_interest_rate_percent,
            "Coupon Rate (%)": coupon_rate,
            "Effective Coupon (%)": effective_coupon_rate,
            "Original Nominal": all_nominal[i],
            "Adjusted Nominal": nominal_pmt,
            "Buffer In": buffer,
            "Cash Flow Total": c_flow,
            "Reinvestment Return": r_return,
            "Buffer Reinvestment": buffer_reinv,
            "Total Available": total_available,
            "Principal": principal,
            "Interest": interest,
            "Coupon Payment": coupon_payment,
            "Nominal Payment": nominal_pmt,
            "Total Payment": total_payment,
            "Buffer Out": new_buffer,
            "Buffer Cash Flow Ratio (%)": buffer_cf_ratio,
            "Discount Factor": discount_factor,
            "Is Class A": is_class_a
        })
        
        # Update buffer for next tranche
        buffer = new_buffer
    
    # Filter for Class A and Class B
    class_a_results = [r for r in results if r.get("Is Class A")]
    class_b_results = [r for r in results if not r.get("Is Class A")]
    
    # Calculate totals
    class_a_total = sum(r["Total Payment"] for r in class_a_results)
    class_b_total = sum(r["Total Payment"] for r in class_b_results)
    class_a_principal = sum(r["Principal"] for r in class_a_results)
    class_b_principal = sum(r["Principal"] for r in class_b_results)
    class_a_interest = sum(r["Interest"] for r in class_a_results)
    class_b_coupon = sum(r["Coupon Payment"] for r in class_b_results)
    min_buffer_actual = min(r["Buffer Cash Flow Ratio (%)"] for r in class_a_results) if class_a_results else 0.0
    
    # Calculate total principal paid and loan principal for financing cost
    total_principal_paid = class_a_principal + class_b_principal
    total_loan_principal = df_calc['principal_amount'].sum()
    financing_cost = total_principal_paid - total_loan_principal
    
    # Create and return the calculation result
    return CalculationResult(
        class_a_total=class_a_total,
        class_b_total=class_b_total,
        class_a_principal=class_a_principal,
        class_b_principal=class_b_principal,
        class_a_interest=class_a_interest,
        class_b_coupon=class_b_coupon,
        min_buffer_actual=min_buffer_actual,
        total_principal_paid=total_principal_paid,
        total_loan_principal=total_loan_principal,
        financing_cost=financing_cost,
        tranche_results=results,
        interest_rate_conversions=interest_rate_conversions
    )