import time
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Catalog of 45+ currencies with symbols, names, and regional flags
CURRENCY_CATALOG = [
    {"code": "USD", "name": "US Dollar", "symbol": "$", "flag": "🇺🇸"},
    {"code": "EUR", "name": "Euro", "symbol": "€", "flag": "🇪🇺"},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "flag": "🇬🇧"},
    {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "flag": "🇯🇵"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "CA$", "flag": "🇨🇦"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "AU$", "flag": "🇦🇺"},
    {"code": "CHF", "name": "Swiss Franc", "symbol": "CHF", "flag": "🇨🇭"},
    {"code": "CNY", "name": "Chinese Yuan", "symbol": "¥", "flag": "🇨🇳"},
    {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "flag": "🇮🇳"},
    {"code": "SGD", "name": "Singapore Dollar", "symbol": "SG$", "flag": "🇸🇬"},
    {"code": "AED", "name": "UAE Dirham", "symbol": "AED", "flag": "🇦🇪"},
    {"code": "THB", "name": "Thai Baht", "symbol": "฿", "flag": "🇹🇭"},
    {"code": "KRW", "name": "South Korean Won", "symbol": "₩", "flag": "🇰🇷"},
    {"code": "BRL", "name": "Brazilian Real", "symbol": "R$", "flag": "🇧🇷"},
    {"code": "MXN", "name": "Mexican Peso", "symbol": "MX$", "flag": "🇲🇽"},
    {"code": "HKD", "name": "Hong Kong Dollar", "symbol": "HK$", "flag": "🇭🇰"},
    {"code": "NZD", "name": "New Zealand Dollar", "symbol": "NZ$", "flag": "🇳🇿"},
    {"code": "SEK", "name": "Swedish Krona", "symbol": "kr", "flag": "🇸🇪"},
    {"code": "NOK", "name": "Norwegian Krone", "symbol": "kr", "flag": "🇳🇴"},
    {"code": "DKK", "name": "Danish Krone", "symbol": "kr", "flag": "🇩🇰"},
    {"code": "ZAR", "name": "South African Rand", "symbol": "R", "flag": "🇿🇦"},
    {"code": "TRY", "name": "Turkish Lira", "symbol": "₺", "flag": "🇹🇷"},
    {"code": "IDR", "name": "Indonesian Rupiah", "symbol": "Rp", "flag": "🇮🇩"},
    {"code": "MYR", "name": "Malaysian Ringgit", "symbol": "RM", "flag": "🇲🇾"},
    {"code": "PHP", "name": "Philippine Peso", "symbol": "₱", "flag": "🇵🇭"},
    {"code": "VND", "name": "Vietnamese Dong", "symbol": "₫", "flag": "🇻🇳"},
    {"code": "PLN", "name": "Polish Zloty", "symbol": "zł", "flag": "🇵🇱"},
    {"code": "CZK", "name": "Czech Koruna", "symbol": "Kč", "flag": "🇨🇿"},
    {"code": "HUF", "name": "Hungarian Forint", "symbol": "Ft", "flag": "🇭🇺"},
    {"code": "ILS", "name": "Israeli Shekel", "symbol": "₪", "flag": "🇮🇱"},
    {"code": "CLP", "name": "Chilean Peso", "symbol": "CLP$", "flag": "🇨🇱"},
    {"code": "COP", "name": "Colombian Peso", "symbol": "COL$", "flag": "🇨🇴"},
    {"code": "EGP", "name": "Egyptian Pound", "symbol": "E£", "flag": "🇪🇬"},
    {"code": "SAR", "name": "Saudi Riyal", "symbol": "SR", "flag": "🇸🇦"},
    {"code": "TWD", "name": "New Taiwan Dollar", "symbol": "NT$", "flag": "🇹🇼"},
    {"code": "ARS", "name": "Argentine Peso", "symbol": "AR$", "flag": "🇦🇷"},
    {"code": "KES", "name": "Kenyan Shilling", "symbol": "KSh", "flag": "🇰🇪"},
    {"code": "MAD", "name": "Moroccan Dirham", "symbol": "DH", "flag": "🇲🇦"},
    {"code": "QAR", "name": "Qatari Riyal", "symbol": "QR", "flag": "🇶🇦"},
    {"code": "KWD", "name": "Kuwaiti Dinar", "symbol": "KD", "flag": "🇰🇼"},
    {"code": "BHD", "name": "Bahraini Dinar", "symbol": "BD", "flag": "🇧🇭"},
    {"code": "OMR", "name": "Omani Rial", "symbol": "OMR", "flag": "🇴🇲"},
    {"code": "ISK", "name": "Icelandic Krona", "symbol": "kr", "flag": "🇮🇸"},
    {"code": "CRC", "name": "Costa Rican Colon", "symbol": "₡", "flag": "🇨🇷"},
    {"code": "PEN", "name": "Peruvian Sol", "symbol": "S/.", "flag": "🇵🇪"},
    {"code": "PKR", "name": "Pakistani Rupee", "symbol": "₨", "flag": "🇵🇰"},
    {"code": "BDT", "name": "Bangladeshi Taka", "symbol": "৳", "flag": "🇧🇩"},
    {"code": "LKR", "name": "Sri Lankan Rupee", "symbol": "Rs", "flag": "🇱🇰"},
    {"code": "NPR", "name": "Nepalese Rupee", "symbol": "Rs", "flag": "🇳🇵"},
    {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "flag": "🇳🇬"},
    {"code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵", "flag": "🇬🇭"},
    {"code": "TZS", "name": "Tanzanian Shilling", "symbol": "TSh", "flag": "🇹🇿"},
    {"code": "UGX", "name": "Ugandan Shilling", "symbol": "USh", "flag": "🇺🇬"},
    {"code": "MUR", "name": "Mauritian Rupee", "symbol": "Rs", "flag": "🇲🇺"},
    {"code": "JOD", "name": "Jordanian Dinar", "symbol": "JD", "flag": "🇯🇴"},
    {"code": "BGN", "name": "Bulgarian Lev", "symbol": "лв", "flag": "🇧🇬"},
    {"code": "RON", "name": "Romanian Leu", "symbol": "lei", "flag": "🇷🇴"},
    {"code": "RSD", "name": "Serbian Dinar", "symbol": "din", "flag": "🇷🇸"},
    {"code": "GEL", "name": "Georgian Lari", "symbol": "₾", "flag": "🇬🇪"},
    {"code": "AZN", "name": "Azerbaijani Manat", "symbol": "₼", "flag": "🇦🇿"},
    {"code": "KZT", "name": "Kazakhstani Tenge", "symbol": "₸", "flag": "🇰🇿"},
    {"code": "UZS", "name": "Uzbekistani Som", "symbol": "soʻm", "flag": "🇺🇿"},
    {"code": "MNT", "name": "Mongolian Tugrik", "symbol": "₮", "flag": "🇲🇳"},
    {"code": "KHR", "name": "Cambodian Riel", "symbol": "៛", "flag": "🇰🇭"},
    {"code": "LAK", "name": "Lao Kip", "symbol": "₭", "flag": "🇱🇦"},
    {"code": "JMD", "name": "Jamaican Dollar", "symbol": "J$", "flag": "🇯🇲"},
    {"code": "DOP", "name": "Dominican Peso", "symbol": "RD$", "flag": "🇩🇴"},
    {"code": "FJD", "name": "Fijian Dollar", "symbol": "FJ$", "flag": "🇫🇯"},
    {"code": "UAH", "name": "Ukrainian Hryvnia", "symbol": "₴", "flag": "🇺🇦"},
    {"code": "BAM", "name": "Bosnia Mark", "symbol": "KM", "flag": "🇧🇦"},
    {"code": "ALL", "name": "Albanian Lek", "symbol": "L", "flag": "🇦🇱"},
]

# High-fidelity offline reference exchange rates relative to USD (1 USD = X)
BASELINE_USD_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 151.2,
    "CAD": 1.36,
    "AUD": 1.52,
    "CHF": 0.90,
    "CNY": 7.23,
    "INR": 83.4,
    "SGD": 1.35,
    "AED": 3.67,
    "THB": 36.8,
    "KRW": 1365.0,
    "BRL": 5.15,
    "MXN": 16.7,
    "HKD": 7.82,
    "NZD": 1.66,
    "SEK": 10.8,
    "NOK": 10.9,
    "DKK": 6.87,
    "ZAR": 18.5,
    "TRY": 32.4,
    "IDR": 16150.0,
    "MYR": 4.74,
    "PHP": 57.2,
    "VND": 25400.0,
    "PLN": 3.98,
    "CZK": 23.4,
    "HUF": 365.0,
    "ILS": 3.72,
    "CLP": 945.0,
    "COP": 3890.0,
    "EGP": 47.5,
    "SAR": 3.75,
    "TWD": 32.4,
    "ARS": 880.0,
    "KES": 132.0,
    "MAD": 10.05,
    "QAR": 3.64,
    "KWD": 0.31,
    "BHD": 0.38,
    "OMR": 0.38,
    "ISK": 139.5,
    "CRC": 510.0,
    "PEN": 3.72,
    "PKR": 278.5,
    "BDT": 117.5,
    "LKR": 303.0,
    "NPR": 133.5,
    "NGN": 1490.0,
    "GHS": 14.8,
    "TZS": 2680.0,
    "UGX": 3720.0,
    "MUR": 46.5,
    "JOD": 0.709,
    "BGN": 1.80,
    "RON": 4.58,
    "RSD": 107.8,
    "GEL": 2.72,
    "AZN": 1.70,
    "KZT": 475.0,
    "UZS": 12650.0,
    "MNT": 3450.0,
    "KHR": 4100.0,
    "LAK": 21800.0,
    "JMD": 156.0,
    "DOP": 59.2,
    "FJD": 2.26,
    "UAH": 40.8,
    "BAM": 1.80,
    "ALL": 92.5,
}

class CurrencyService:
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 3600  # 1 hour
        self._last_fetch_time = 0

    async def get_exchange_rates(self, base: str = "USD") -> Dict[str, Any]:
        base = base.upper().strip()
        now = time.time()

        # Check in-memory cache
        cache_key = f"rates_{base}"
        if cache_key in self._cache and (now - self._cache[cache_key]["timestamp"]) < self._cache_ttl:
            return self._cache[cache_key]["data"]

        # Attempt to fetch live rates from free Open Exchange Rate API
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(f"https://open.er-api.com/v6/latest/{base}")
                if res.status_code == 200:
                    payload = res.json()
                    rates = payload.get("rates", {})
                    # Augment with baseline if missing
                    data = {
                        "base": base,
                        "rates": rates,
                        "currencies": CURRENCY_CATALOG,
                        "updated_at": payload.get("time_last_update_utc", time.strftime("%Y-%m-%d %H:%M:%S UTC")),
                        "provider": "live"
                    }
                    self._cache[cache_key] = {"data": data, "timestamp": now}
                    return data
        except Exception as e:
            logger.warning(f"Live exchange rates fetch failed: {e}. Using offline baseline rates.")

        # Compute cross-rates using offline baseline
        base_rate_usd = BASELINE_USD_RATES.get(base, 1.0)
        computed_rates: Dict[str, float] = {}
        for c, r_usd in BASELINE_USD_RATES.items():
            # 1 base = (r_usd / base_rate_usd) of currency c
            computed_rates[c] = round(r_usd / base_rate_usd, 4)

        data = {
            "base": base,
            "rates": computed_rates,
            "currencies": CURRENCY_CATALOG,
            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "provider": "offline_fallback"
        }
        self._cache[cache_key] = {"data": data, "timestamp": now}
        return data

    def convert(self, amount: float, from_currency: str, to_currency: str, rates: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        from_currency = from_currency.upper().strip()
        to_currency = to_currency.upper().strip()

        if from_currency == to_currency:
            return {
                "original_amount": amount,
                "from_currency": from_currency,
                "converted_amount": amount,
                "to_currency": to_currency,
                "rate": 1.0
            }

        if rates and from_currency in rates and to_currency in rates:
            # If rates are relative to a common base
            rate = rates[to_currency] / rates[from_currency]
        else:
            base_from = BASELINE_USD_RATES.get(from_currency, 1.0)
            base_to = BASELINE_USD_RATES.get(to_currency, 1.0)
            rate = base_to / base_from

        converted = round(amount * rate, 2)
        return {
            "original_amount": amount,
            "from_currency": from_currency,
            "converted_amount": converted,
            "to_currency": to_currency,
            "rate": round(rate, 4)
        }

currency_service = CurrencyService()
