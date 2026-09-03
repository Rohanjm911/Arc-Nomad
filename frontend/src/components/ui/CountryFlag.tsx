import React, { useState } from 'react';

export const CURRENCY_COUNTRY_MAP: Record<string, string> = {
  USD: 'us',
  EUR: 'eu',
  GBP: 'gb',
  JPY: 'jp',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
  CNY: 'cn',
  INR: 'in',
  SGD: 'sg',
  AED: 'ae',
  THB: 'th',
  KRW: 'kr',
  BRL: 'br',
  MXN: 'mx',
  HKD: 'hk',
  NZD: 'nz',
  SEK: 'se',
  NOK: 'no',
  DKK: 'dk',
  ZAR: 'za',
  TRY: 'tr',
  IDR: 'id',
  MYR: 'my',
  PHP: 'ph',
  VND: 'vn',
  PLN: 'pl',
  CZK: 'cz',
  HUF: 'hu',
  ILS: 'il',
  CLP: 'cl',
  COP: 'co',
  EGP: 'eg',
  SAR: 'sa',
  TWD: 'tw',
  ARS: 'ar',
  KES: 'ke',
  MAD: 'ma',
  QAR: 'qa',
  KWD: 'kw',
  BHD: 'bh',
  OMR: 'om',
  ISK: 'is',
  CRC: 'cr',
  PEN: 'pe',
  PKR: 'pk',
  BDT: 'bd',
  LKR: 'lk',
  NPR: 'np',
  NGN: 'ng',
  GHS: 'gh',
  TZS: 'tz',
  UGX: 'ug',
  MUR: 'mu',
  JOD: 'jo',
  BGN: 'bg',
  RON: 'ro',
  RSD: 'rs',
  GEL: 'ge',
  AZN: 'az',
  KZT: 'kz',
  UZS: 'uz',
  MNT: 'mn',
  KHR: 'kh',
  LAK: 'la',
  JMD: 'jm',
  DOP: 'do',
  FJD: 'fj',
  UAH: 'ua',
  BAM: 'ba',
  ALL: 'al',
  MVR: 'mv',
  MMK: 'mm',
  BND: 'bn',
  LBP: 'lb',
  DZD: 'dz',
  TND: 'tn',
  BOB: 'bo',
  PYG: 'py',
  UYU: 'uy',
  GTQ: 'gt',
  HNL: 'hn',
  NIO: 'ni',
  PAB: 'pa',
  BSD: 'bs',
  BBD: 'bb',
  TTD: 'tt',
  XCD: 'ag',
  AMD: 'am',
  MDL: 'md',
  MKD: 'mk',
  BWP: 'bw',
  NAD: 'na',
  ZMW: 'zm',
  MZN: 'mz',
  ETB: 'et',
  RWF: 'rw',
  XOF: 'sn',
  XAF: 'cm',
  KGS: 'kg',
  TJS: 'tj',
  IQD: 'iq',
};

interface CountryFlagProps {
  currencyCode: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  fallbackEmoji?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  currencyCode,
  size = 'sm',
  className = '',
  fallbackEmoji,
}) => {
  const [hasError, setHasError] = useState(false);
  const code = (currencyCode || '').toUpperCase().trim();
  const countryCode = CURRENCY_COUNTRY_MAP[code] || (code.length === 3 ? code.slice(0, 2).toLowerCase() : 'un');

  const sizeClasses = {
    xs: 'w-4 h-2.5 min-w-[16px]',
    sm: 'w-5 h-3.5 min-w-[20px]',
    md: 'w-6 h-4 min-w-[24px]',
    lg: 'w-7 h-5 min-w-[28px]',
  };

  if (hasError) {
    if (fallbackEmoji) {
      return <span className="inline-block text-sm shrink-0 leading-none">{fallbackEmoji}</span>;
    }
    return (
      <span className="inline-flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded px-1 shrink-0">
        {code.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt={`${code} flag`}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`inline-block ${sizeClasses[size]} rounded-[3px] object-cover shadow-xs border border-slate-700/80 shrink-0 ${className}`}
    />
  );
};
