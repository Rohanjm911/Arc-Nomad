import { apiClient } from './api';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  currencies: CurrencyItem[];
  updated_at: string;
  provider: string;
}

export const FALLBACK_CURRENCIES: CurrencyItem[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'SG$', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', flag: '🇨🇴' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', flag: '🇦🇷' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', flag: '🇲🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' },
  { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡', flag: '🇨🇷' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', flag: '🇳🇵' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: 'Rs', flag: '🇲🇺' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', flag: '🇯🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'din', flag: '🇷🇸' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', flag: '🇺🇿' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', flag: '🇲🇳' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'BAM', name: 'Bosnia Mark', symbol: 'KM', flag: '🇧🇦' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', flag: '🇱🇧' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', flag: '🇩🇿' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', flag: '🇹🇳' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', flag: '🇧🇴' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', flag: '🇵🇾' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳' },
  { code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$', flag: '🇳🇮' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', flag: '🇧🇧' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', flag: '🇹🇹' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🇦🇬' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇸🇳' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', flag: '🇰🇬' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', flag: '🇹🇯' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ID', flag: '🇮🇶' },
];

export const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.90,
  CNY: 7.23,
  INR: 83.4,
  SGD: 1.35,
  AED: 3.67,
  THB: 36.8,
  KRW: 1365.0,
  BRL: 5.15,
  MXN: 16.7,
  HKD: 7.82,
  NZD: 1.66,
  SEK: 10.8,
  NOK: 10.9,
  DKK: 6.87,
  ZAR: 18.5,
  TRY: 32.4,
  IDR: 16150.0,
  MYR: 4.74,
  PHP: 57.2,
  VND: 25400.0,
  PLN: 3.98,
  CZK: 23.4,
  HUF: 365.0,
  ILS: 3.72,
  CLP: 945.0,
  COP: 3890.0,
  EGP: 47.5,
  SAR: 3.75,
  TWD: 32.4,
  ARS: 880.0,
  KES: 132.0,
  MAD: 10.05,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  ISK: 139.5,
  CRC: 510.0,
  PEN: 3.72,
  PKR: 278.5,
  BDT: 117.5,
  LKR: 303.0,
  NPR: 133.5,
  NGN: 1490.0,
  GHS: 14.8,
  TZS: 2680.0,
  UGX: 3720.0,
  MUR: 46.5,
  JOD: 0.709,
  BGN: 1.80,
  RON: 4.58,
  RSD: 107.8,
  GEL: 2.72,
  AZN: 1.70,
  KZT: 475.0,
  UZS: 12650.0,
  MNT: 3450.0,
  KHR: 4100.0,
  LAK: 21800.0,
  JMD: 156.0,
  DOP: 59.2,
  FJD: 2.26,
  UAH: 40.8,
  BAM: 1.80,
  ALL: 92.5,
};

class CurrencyService {
  private cache: Record<string, { data: ExchangeRateResponse; timestamp: number }> = {};
  private readonly CACHE_TTL = 300000; // 5 minutes in memory

  async getExchangeRates(base = 'USD'): Promise<ExchangeRateResponse> {
    const normBase = base.toUpperCase().trim();
    const now = Date.now();

    if (this.cache[normBase] && now - this.cache[normBase].timestamp < this.CACHE_TTL) {
      return this.cache[normBase].data;
    }

    try {
      const data = await apiClient<ExchangeRateResponse>(`/expenses/exchange-rates/latest?base=${normBase}`);
      this.cache[normBase] = { data, timestamp: now };
      return data;
    } catch (err) {
      console.warn('Backend exchange-rate API unavailable, using client fallback matrix:', err);
      // Client-side cross-rate calculation
      const baseRate = FALLBACK_USD_RATES[normBase] || 1.0;
      const computedRates: Record<string, number> = {};
      for (const [curr, r] of Object.entries(FALLBACK_USD_RATES)) {
        computedRates[curr] = Number((r / baseRate).toFixed(4));
      }

      const fallbackData: ExchangeRateResponse = {
        base: normBase,
        rates: computedRates,
        currencies: FALLBACK_CURRENCIES,
        updated_at: new Date().toISOString(),
        provider: 'client_fallback',
      };
      return fallbackData;
    }
  }

  convert(
    amount: number,
    from: string,
    to: string,
    rates?: Record<string, number>
  ): { convertedAmount: number; rate: number } {
    const f = from.toUpperCase().trim();
    const t = to.toUpperCase().trim();

    if (f === t || !amount) {
      return { convertedAmount: amount, rate: 1.0 };
    }

    let rate = 1.0;
    if (rates && rates[t] != null && rates[f] != null && rates[f] > 0) {
      rate = rates[t] / rates[f];
    } else {
      const fromRate = FALLBACK_USD_RATES[f] || 1.0;
      const toRate = FALLBACK_USD_RATES[t] || 1.0;
      rate = toRate / fromRate;
    }

    const convertedAmount = Number((amount * rate).toFixed(2));
    return { convertedAmount, rate: Number(rate.toFixed(4)) };
  }
}

export const currencyService = new CurrencyService();

export function getCurrencyItem(code: string): CurrencyItem {
  const norm = (code || 'USD').toUpperCase().trim();
  return (
    FALLBACK_CURRENCIES.find((c) => c.code === norm) || {
      code: norm,
      name: norm,
      symbol: norm,
      flag: '🌐',
    }
  );
}

export function getCurrencySymbol(code: string): string {
  return getCurrencyItem(code).symbol || code;
}
