"""
Utility functions for cash flow processing and tranche calculations.
"""
import pandas as pd
import numpy as np
from datetime import timedelta
from typing import List, Dict, Any, Tuple
from app.utils.finance_utils import (
    get_next_business_day,
    simple_to_compound_annual,
    calculate_reinvestment_date
)

def assign_cash_flows_to_tranches(
    df: pd.DataFrame, 
    start_date: pd.Timestamp, 
    all_maturity_dates: List[pd.Timestamp], 
    all_reinvest_rates: List[float]
) -> List[List[Dict[str, Any]]]:
    """
    Distribute cash flows into tranches, adjust for weekends,
    and calculate reinvestment returns.
    
    Args:
        df: DataFrame containing cash flow data
        start_date: Start date for calculations
        all_maturity_dates: List of maturity dates for each tranche
        all_reinvest_rates: List of reinvestment rates for each tranche
        
    Returns:
        List of cash flow lists for each tranche
    """
    num_tranches = len(all_maturity_dates)
    tranch_cash_flows = [[] for _ in range(num_tranches)]
    
    for idx, row in df.iterrows():
        inst_date = row['installment_date']
        cf = row['cash_flow']
        principal_amt = row.get('principal_amount', 0)
        interest_amt = row.get('interest_amount', 0)
        
        if pd.isnull(inst_date) or inst_date < start_date:
            continue
        
        reinvest_date = calculate_reinvestment_date(inst_date)
        assigned = False
        
        # First pass - assign to the first matching tranche
        for i in range(num_tranches):
            if inst_date < all_maturity_dates[i]:
                if reinvest_date < all_maturity_dates[i]:
                    days_diff = (all_maturity_dates[i] - reinvest_date).days
                    if days_diff > 0:
                        r_compound = simple_to_compound_annual(all_reinvest_rates[i]) / 100.0
                        factor = (1 + r_compound)**(days_diff/365) - 1
                        r_return = cf * factor
                    else:
                        r_return = 0.0
                    tranch_cash_flows[i].append({
                        'date': inst_date,
                        'cash_flow': cf,
                        'principal_amount': principal_amt,
                        'interest_amount': interest_amt,
                        'reinvest_date': reinvest_date,
                        'reinvestment_return': r_return,
                        'moved_from': None
                    })
                    assigned = True
                    break
        
        # If not assigned in first pass
        if not assigned and num_tranches > 0:
            # Second pass - assign based on reinvest date
            re_assign = False
            for i in range(num_tranches):
                if reinvest_date < all_maturity_dates[i]:
                    days_diff = (all_maturity_dates[i] - reinvest_date).days
                    if days_diff > 0:
                        r_compound = simple_to_compound_annual(all_reinvest_rates[i]) / 100.0
                        factor = (1 + r_compound)**(days_diff/365) - 1
                        r_return = cf * factor
                    else:
                        r_return = 0.0
                    tranch_cash_flows[i].append({
                        'date': inst_date,
                        'cash_flow': cf,
                        'principal_amount': principal_amt,
                        'interest_amount': interest_amt,
                        'reinvest_date': reinvest_date,
                        'reinvestment_return': r_return,
                        'moved_from': None
                    })
                    re_assign = True
                    break
            
            # If still not assigned, put in the last tranche
            if not re_assign:
                last_idx = num_tranches - 1
                days_diff = (all_maturity_dates[last_idx] - reinvest_date).days
                if days_diff > 0:
                    r_compound = simple_to_compound_annual(all_reinvest_rates[last_idx]) / 100.0
                    factor = (1 + r_compound)**(days_diff/365) - 1
                    r_return = cf * factor
                else:
                    r_return = 0.0
                tranch_cash_flows[last_idx].append({
                    'date': inst_date,
                    'cash_flow': cf,
                    'principal_amount': principal_amt,
                    'interest_amount': interest_amt,
                    'reinvest_date': reinvest_date,
                    'reinvestment_return': r_return,
                    'moved_from': None,
                    'note': 'Reinvestment date >= all'
                })
    
    # Third pass: if reinvest_date >= current tranche maturity, move the cash flow to a later tranche
    for i in range(num_tranches-1):
        final_cf = []
        for cf_info in tranch_cash_flows[i]:
            if cf_info['reinvest_date'] >= all_maturity_dates[i]:
                moved = False
                for j in range(i+1, num_tranches):
                    if cf_info['reinvest_date'] < all_maturity_dates[j]:
                        days_diff = (all_maturity_dates[j] - cf_info['reinvest_date']).days
                        if days_diff > 0:
                            r_compound = simple_to_compound_annual(all_reinvest_rates[j]) / 100.0
                            factor = (1 + r_compound)**(days_diff/365) - 1
                            new_ret = cf_info['cash_flow'] * factor
                        else:
                            new_ret = 0.0
                        new_cf = dict(cf_info)
                        new_cf['reinvestment_return'] = new_ret
                        new_cf['moved_from'] = i
                        tranch_cash_flows[j].append(new_cf)
                        moved = True
                        break
                
                if not moved and (i+1) < num_tranches:
                    last_i = num_tranches - 1
                    days_diff = (all_maturity_dates[last_i] - cf_info['reinvest_date']).days
                    if days_diff > 0:
                        r_compound = simple_to_compound_annual(all_reinvest_rates[last_i]) / 100.0
                        factor = (1 + r_compound)**(days_diff/365) - 1
                        new_ret = cf_info['cash_flow'] * factor
                    else:
                        new_ret = 0.0
                    new_cf = dict(cf_info)
                    new_cf['reinvestment_return'] = new_ret
                    new_cf['moved_from'] = i
                    tranch_cash_flows[last_i].append(new_cf)
            else:
                final_cf.append(cf_info)
        
        tranch_cash_flows[i] = final_cf
    
    return tranch_cash_flows

def calculate_totals(
    cash_flows: List[Dict[str, Any]], 
    maturity_date: pd.Timestamp, 
    reinvest_rate: float
) -> Tuple[float, float, float, float]:
    """
    Calculate totals for a tranche.
    
    Args:
        cash_flows: List of cash flow information dictionaries
        maturity_date: Maturity date for the tranche
        reinvest_rate: Reinvestment rate for the tranche
        
    Returns:
        Tuple of (total_cash_flow, total_reinvest, total_principal, total_interest)
    """
    r_comp = simple_to_compound_annual(reinvest_rate)
    total_cash_flow = 0.0
    total_principal = 0.0
    total_interest = 0.0
    total_reinvest = 0.0
    
    for c in cash_flows:
        cf = c['cash_flow']
        principal = c.get('principal_amount', 0)
        interest = c.get('interest_amount', 0)
        
        total_cash_flow += cf
        total_principal += principal
        total_interest += interest
        
        rd = c['reinvest_date']
        days_diff = (maturity_date - rd).days
        
        if days_diff > 0:
            factor = (1 + r_comp/100)**(days_diff/365) - 1
            ret = cf * factor
            total_reinvest += ret
    
    return total_cash_flow, total_reinvest, total_principal, total_interest