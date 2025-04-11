# backend/app/utils/finance_utils.py
import pandas as pd
from datetime import datetime, timedelta

def simple_to_compound_annual(simple_rate_percent):
    """Convert an annual simple rate (in %) to an annual compounded rate (in %)."""
    r_simple = simple_rate_percent / 100.0
    # daily rate under simple assumption:
    r_daily = r_simple / 365
    annual_compound = (1 + r_daily)**365 - 1
    return annual_compound * 100.0

def simple_to_maturity_compound(simple_rate_percent, days):
    """Convert a simple rate over 'days' to an equivalent annual compounded rate."""
    if days <= 0:
        return 0.0
    r_simple = simple_rate_percent / 100.0
    period_simple = r_simple * (days / 365)  # portion of the year
    period_compound = (1 + period_simple)**(365 / days) - 1
    return period_compound * 100.0

def overnight_to_annual_compound(simple_rate_percent):
    """Convert an annual simple rate to annual compound."""
    daily_rate = simple_rate_percent / 365 / 100
    annual_compound = (1 + daily_rate)**365 - 1
    return annual_compound * 100.0

def get_next_business_day(date):
    """If the date falls on a weekend, move it to the next business day."""
    while date.weekday() >= 5:  # 5=Saturday, 6=Sunday
        date += timedelta(days=1)
    return date

def calculate_reinvestment_date(installment_date):
    """Adjust the installment date for weekends and add 1 day."""
    if installment_date.weekday() >= 5:
        installment_date = get_next_business_day(installment_date)
    reinvest_date = installment_date + timedelta(days=1)
    reinvest_date = get_next_business_day(reinvest_date)
    return reinvest_date

def get_nearest_maturity(target_maturity, available_maturities):
    """Find the closest maturity day in the available maturities."""
    return min(available_maturities, key=lambda x: abs(x - target_maturity))

def get_last_cash_flow_day(df, start_date):
    """Find the last cash flow day and calculate as days from start date."""
    start_date = pd.Timestamp(start_date)
    last_cash_flow_date = df['installment_date'].max()
    
    if pd.notna(last_cash_flow_date):
        days = (last_cash_flow_date - start_date).days
        return max(0, days)  # Should not be negative
    else:
        return 365  # Default value