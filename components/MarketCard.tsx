import React, { useState } from 'react';
import { MarketPrice, Language } from '../types';
import { TrendingUp, TrendingDown, Minus, MapPin, CheckCircle2, User, Clock, ThumbsUp } from 'lucide-react';

interface MarketCardProps {
  market: MarketPrice;
  itemName: string;
  itemImage?: string;
  language: Language;
}

const translations = {
  en: {
    verified: 'Verified',
    verifiedByYou: 'Verified by You',
    quality: 'Quality',
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last Week',
    verifyBtn: 'Verify This Price',
    confirmedBtn: 'Price Confirmed',
    reportedBy: 'Reported By',
    time: 'Time',
    trend: 'Trend',
    stable: 'Stable',
    up: 'Up',
    down: 'Down'
  },
  ur: {
    verified: 'تصدیق شدہ',
    verifiedByYou: 'آپ کی طرف سے تصدیق شدہ',
    quality: 'معیار',
    today: 'آج',
    yesterday: 'کل',
    lastWeek: 'گزشتہ ہفتہ',
    verifyBtn: 'قیمت کی تصدیق کریں',
    confirmedBtn: 'قیمت کی تصدیق ہو گئی',
    reportedBy: 'رپورٹر',
    time: 'وقت',
    trend: 'رجحان',
    stable: 'مستحکم',
    up: 'بڑھ رہی ہے',
    down: 'کم ہو رہی ہے'
  }
};

const MarketCard: React.FC<MarketCardProps> = ({ market, itemName, itemImage, language }) => {
  const [userVerified, setUserVerified] = useState(false);
  const [imgError, setImgError] = useState(false);
  const t = translations[language];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`bg-white rounded-xl border ${userVerified ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}>
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <div className="leading-tight">
            <h4 className="font-bold text-slate-900 text-sm">{market.marketName}</h4>
            <span className="text-xs text-slate-500">{market.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {market.verified && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.verified}</span>
            </div>
          )}
          {userVerified && (
             <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
               <CheckCircle2 className="h-3 w-3" />
               <span className="text-[10px] font-bold uppercase tracking-wider">{t.verifiedByYou}</span>
             </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 relative group-hover/image">
            {itemImage && !imgError ? (
               <img 
                src={itemImage} 
                alt={itemName} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                onError={() => setImgError(true)}
               />
            ) : (
               <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 text-slate-400">
                  <span className="text-xs font-bold tracking-wider">{getInitials(itemName)}</span>
               </div>
            )}
          </div>
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{itemName}</h3>
            <div className="flex items-center gap-2">
               <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                 {market.quality} {t.quality}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
            <p className="text-[10px] text-emerald-700 uppercase font-bold mb-1">{t.today}</p>
            <p className="text-lg font-bold text-emerald-800">Rs {market.price}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.yesterday}</p>
            <p className="text-sm font-semibold text-slate-600">Rs {market.yesterdayPrice}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.lastWeek}</p>
            <p className="text-sm font-semibold text-slate-600">Rs {market.lastWeekPrice}</p>
          </div>
        </div>

        <button
          onClick={() => setUserVerified(true)}
          disabled={userVerified}
          className={`w-full mb-4 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            userVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          {userVerified ? <><CheckCircle2 className="h-4 w-4" /> {t.confirmedBtn}</> : <><ThumbsUp className="h-4 w-4" /> {t.verifyBtn}</>}
        </button>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
               <User className="h-3 w-3 text-slate-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 font-medium">{t.reportedBy}</span>
                 <span className="text-xs font-semibold text-slate-700">{market.reportedBy}</span>
               </div>
             </div>
             <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
             <div className="hidden sm:flex flex-col">
                 <span className="text-[10px] text-slate-400 font-medium">{t.time}</span>
                 <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">{market.reportTime}</span>
                 </div>
             </div>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-400 font-medium mb-0.5">{t.trend}</span>
             <div className="flex items-center gap-1">
                {getTrendIcon(market.trend)}
                <span className={`text-xs font-bold ${market.trend === 'up' ? 'text-red-600' : market.trend === 'down' ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {t[market.trend as keyof typeof t] || market.trend}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;