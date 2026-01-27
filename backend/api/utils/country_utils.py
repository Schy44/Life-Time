COUNTRY_MASTER_LIST = [
    {"name": "United States", "code": "US"},
    {"name": "Canada", "code": "CA"},
    {"name": "United Kingdom", "code": "GB"},
    {"name": "Australia", "code": "AU"},
    {"name": "Germany", "code": "DE"},
    {"name": "France", "code": "FR"},
    {"name": "Spain", "code": "ES"},
    {"name": "Italy", "code": "IT"},
    {"name": "Japan", "code": "JP"},
    {"name": "China", "code": "CN"},
    {"name": "India", "code": "IN"},
    {"name": "Brazil", "code": "BR"},
    {"name": "Mexico", "code": "MX"},
    {"name": "South Africa", "code": "ZA"},
    {"name": "Nigeria", "code": "NG"},
    {"name": "Egypt", "code": "EG"},
    {"name": "Argentina", "code": "AR"},
    {"name": "Sweden", "code": "SE"},
    {"name": "Norway", "code": "NO"},
    {"name": "Denmark", "code": "DK"},
    {"name": "Finland", "code": "FI"},
    {"name": "Netherlands", "code": "NL"},
    {"name": "Belgium", "code": "BE"},
    {"name": "Switzerland", "code": "CH"},
    {"name": "Austria", "code": "AT"},
    {"name": "Portugal", "code": "PT"},
    {"name": "Greece", "code": "GR"},
    {"name": "Ireland", "code": "IE"},
    {"name": "New Zealand", "code": "NZ"},
    {"name": "Singapore", "code": "SG"},
    {"name": "Malaysia", "code": "MY"},
    {"name": "Indonesia", "code": "ID"},
    {"name": "Thailand", "code": "TH"},
    {"name": "Vietnam", "code": "VN"},
    {"name": "Philippines", "code": "PH"},
    {"name": "South Korea", "code": "KR"},
    {"name": "Russia", "code": "RU"},
    {"name": "Saudi Arabia", "code": "SA"},
    {"name": "United Arab Emirates", "code": "AE"},
    {"name": "Turkey", "code": "TR"},
    {"name": "Ukraine", "code": "UA"},
    {"name": "Poland", "code": "PL"},
    {"name": "Czech Republic", "code": "CZ"},
    {"name": "Hungary", "code": "HU"},
    {"name": "Romania", "code": "RO"},
    {"name": "Chile", "code": "CL"},
    {"name": "Colombia", "code": "CO"},
    {"name": "Peru", "code": "PE"},
    {"name": "Pakistan", "code": "PK"},
    {"name": "Bangladesh", "code": "BD"},
    {"name": "Sri Lanka", "code": "LK"},
]

def get_country_name(code):
    """
    Returns the full name of a country given its ISO code.
    Fallback to the code itself if not found.
    """
    if not code:
        return ""
    
    code_upper = str(code).upper()
    for country in COUNTRY_MASTER_LIST:
        if country['code'].upper() == code_upper:
            return country['name']
            
    return code
