class CurrencyService:
    # Hardcoded for now as per user request for simplicity, 
    # but could be updated via AppConfig or even an external API
    DEFAULT_RATES = {
        'BDT': 1.0,
        'USD': 0.0085, # Example rate: 1 BDT = 0.0085 USD (approx 117 BDT = 1 USD)
    }

    @classmethod
    def convert(cls, amount, from_curr, to_curr):
        if from_curr == to_curr:
            return amount
        
        # Convert to base (BDT) first
        if from_curr != 'BDT':
             # This part requires more complex logic if we have many currencies
             # For now we assume base is always BDT
             pass
        
        rate = cls.DEFAULT_RATES.get(to_curr, 1.0)
        return round(float(amount) * rate, 2)

    @classmethod
    def get_supported_currencies(cls):
        return list(cls.DEFAULT_RATES.keys())
