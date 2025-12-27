import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import { Search, Loader2, AlertCircle, Info, ExternalLink, MapPin, ChevronDown, Filter, ZoomIn, X, RefreshCw } from 'lucide-react';
import { ItemData, Language } from './types';
import { searchItemPrices } from './services/geminiService';
import PriceChart from './components/PriceChart';
import MarketCard from './components/MarketCard';

const RESULTS_PER_PAGE = 4;

const translations = {
  en: {
    heroTitle: 'Price',
    heroGuard: 'Guard',
    heroTagline: 'Real Prices. Real People.',
    heroSub: 'The community-driven price tracker for Pakistan. Check verified rates for vegetables, fruits, and groceries instantly.',
    placeholder: 'Search item (e.g. Potato, Sugar, Chicken)...',
    locationPrioritizing: 'Prioritizing markets near you',
    locationRequesting: 'Locating...',
    locationDisabled: 'Location disabled',
    nationalAvg: 'National Avg.',
    dailyAvg: 'Daily Average',
    perUnit: 'Per kg/unit',
    liveReports: 'Live Reports',
    allCities: 'All Cities',
    fetchMore: 'Fetch More Reports',
    fetchingMore: 'Fetching Community Reports...',
    showingAll: 'Showing all verified reports',
    noImage: 'No Image',
    sources: 'Sources found by Google Search:',
    error: 'Unable to fetch current market rates. Please try again.',
    noMarkets: 'No market reports found for this city.'
  },
  ur: {
    heroTitle: 'پرائس',
    heroGuard: 'گارڈ',
    heroTagline: 'اصلی قیمتیں، اصلی لوگ',
    heroSub: 'پاکستان کا عوامی قیمتوں کا ٹریکر۔ سبزیوں، پھلوں اور اشیائے ضروریہ کی تصدیق شدہ قیمتیں فوری دیکھیں۔',
    placeholder: 'چیز تلاش کریں (جیسے آلو، چینی، چکن)...',
    locationPrioritizing: 'آپ کے قریبی بازاروں کو ترجیح دی جا رہی ہے',
    locationRequesting: 'لوکیشن تلاش کی جا رہی ہے...',
    locationDisabled: 'لوکیشن غیر فعال ہے',
    nationalAvg: 'ملکی اوسط',
    dailyAvg: 'روزانہ کی اوسط',
    perUnit: 'فی کلو/یونٹ',
    liveReports: 'تازہ ترین رپورٹیں',
    allCities: 'تمام شہر',
    fetchMore: 'مزید رپورٹیں دیکھیں',
    fetchingMore: 'رپورٹیں اپ لوڈ ہو رہی ہیں...',
    showingAll: 'تمام تصدیق شدہ رپورٹیں دکھائی جا رہی ہیں',
    noImage: 'تصویر نہیں ہے',
    sources: 'گوگل سرچ سے ملنے والے ذرائع:',
    error: 'مارکیٹ ریٹس حاصل کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔',
    noMarkets: 'اس شہر کے لیے کوئی رپورٹ نہیں ملی۔'
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItemData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [mainImgError, setMainImgError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => { setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocationStatus('granted'); },
        () => setLocationStatus('denied')
      );
    } else setLocationStatus('denied');
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true); setError(null); setData(null); setFilterCity('All'); setMainImgError(false); setVisibleCount(RESULTS_PER_PAGE);
    try {
      const result = await searchItemPrices(searchTerm, userLocation);
      setData(result);
    } catch (err) { setError(t.error); } finally { setLoading(false); }
  };

  const handleFetchMore = () => {
    setIsFetchingMore(true);
    setTimeout(() => { setVisibleCount(p => p + RESULTS_PER_PAGE); setIsFetchingMore(false); }, 800);
  };

  const availableCities = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.markets.map(m => m.city))).sort();
  }, [data]);

  const filteredMarkets = useMemo(() => {
    if (!data) return [];
    return filterCity === 'All' ? data.markets : data.markets.filter(m => m.city === filterCity);
  }, [data, filterCity]);

  const visibleMarkets = useMemo(() => filteredMarkets.slice(0, visibleCount), [filteredMarkets, visibleCount]);
  const hasMore = visibleCount < filteredMarkets.length;

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${language === 'ur' ? 'font-urdu' : ''}`} dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <Header language={language} setLanguage={setLanguage} />

      <main className="flex-grow flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className={`w-full transition-all duration-500 ease-in-out ${data ? 'mt-0' : 'mt-16 sm:mt-24'}`}>
          <div className="text-center max-w-2xl mx-auto mb-8">
            {!data && (
              <>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  {t.heroTitle}<span className="text-emerald-600">{t.heroGuard}</span>
                </h1>
                <p className="text-xl font-medium text-emerald-800 bg-emerald-100 inline-block px-4 py-1 rounded-full mb-6">
                  {t.heroTagline}
                </p>
                <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
                   {t.heroSub}
                </p>
              </>
            )}
            
            <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full h-14 pl-5 pr-14 rounded-2xl border-2 border-slate-200 shadow-sm text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white ${language === 'ur' ? 'pr-5 pl-14 text-right' : ''}`}
              />
              <button 
                type="submit" 
                disabled={loading}
                className={`absolute top-2 h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-70 transition-colors shadow-sm ${language === 'ur' ? 'left-2' : 'right-2'}`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
              {locationStatus === 'granted' ? (
                 <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full animate-fade-in">
                   <MapPin className="h-3 w-3" /> {t.locationPrioritizing}
                 </span>
              ) : locationStatus === 'requesting' ? (
                 <span className="flex items-center gap-1 opacity-70">
                   <Loader2 className="h-3 w-3 animate-spin" /> {t.locationRequesting}
                 </span>
              ) : (
                <span className="opacity-50">{t.locationDisabled}</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="w-full animate-fade-in-up">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div 
                    className={`h-32 w-32 md:h-40 md:w-40 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 relative group ${data.imageUrl && !mainImgError ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (data.imageUrl && !mainImgError) setIsImageModalOpen(true); }}
                  >
                     {data.imageUrl && !mainImgError ? (
                        <>
                            <img src={data.imageUrl} alt={data.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setMainImgError(true)} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn className="text-white h-8 w-8 drop-shadow-md" />
                            </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full bg-emerald-50 text-emerald-600">
                           <span className="text-3xl font-bold tracking-wider opacity-80">{getInitials(data.name)}</span>
                           <span className="text-[10px] mt-1 font-medium uppercase tracking-wide opacity-60">{t.noImage}</span>
                        </div>
                     )}
                  </div>
                </div>

                <div className="flex-grow flex flex-col md:flex-row justify-between gap-6">
                  <div className={language === 'ur' ? 'text-right' : 'text-left'}>
                    <div className="flex items-center gap-3 mb-2 justify-start">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                        {language === 'en' ? data.category : data.categoryUr}
                      </span>
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Info className="h-3 w-3" /> {t.dailyAvg}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{language === 'en' ? data.name : data.nameUr}</h2>
                    <p className="text-slate-600 max-w-xl leading-relaxed">{language === 'en' ? data.description : data.descriptionUr}</p>
                  </div>
                  <div className={`bg-emerald-50 rounded-xl p-4 border border-emerald-100 h-fit min-w-[150px] ${language === 'ur' ? 'text-right' : 'md:text-right'}`}>
                    <p className="text-sm text-emerald-800 font-medium mb-1">{t.nationalAvg}</p>
                    <p className="text-3xl font-bold text-emerald-700">Rs {data.averagePrice}</p>
                    <p className="text-xs text-emerald-600 mt-1 opacity-80">{t.perUnit}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <PriceChart data={data.history} unit={data.markets[0]?.unit || 'unit'} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {filteredMarkets.length}
                </span>
                {t.liveReports}
              </h3>
              
              {availableCities.length > 0 && (
                <div className="relative min-w-[200px]">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none ${language === 'ur' ? 'right-3' : 'left-3'}`}>
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={filterCity}
                    onChange={(e) => { setFilterCity(e.target.value); setVisibleCount(RESULTS_PER_PAGE); }}
                    className={`block w-full py-2 text-sm border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-lg shadow-sm border bg-white appearance-none cursor-pointer hover:bg-slate-50 transition-colors ${language === 'ur' ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'}`}
                  >
                    <option value="All">{t.allCities}</option>
                    {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-slate-700 ${language === 'ur' ? 'left-0' : 'right-0'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              {visibleMarkets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {visibleMarkets.map((market, index) => (
                    <div key={`${market.marketName}-${index}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <MarketCard market={market} itemName={language === 'en' ? data.name : data.nameUr} itemImage={data.imageUrl} language={language} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-500">{t.noMarkets}</p>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="flex justify-center mb-10">
                <button onClick={handleFetchMore} disabled={isFetchingMore} className="group flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all shadow-sm active:scale-95 disabled:opacity-70">
                  {isFetchingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.fetchingMore}</> : <><RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> {t.fetchMore}</>}
                </button>
              </div>
            )}

            {!hasMore && filteredMarkets.length > RESULTS_PER_PAGE && (
              <div className="text-center mb-10"><p className="text-slate-400 text-sm italic font-medium">{t.showingAll} {filteredMarkets.length}</p></div>
            )}

             {data.sourceUrls && data.sourceUrls.length > 0 && (
              <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-500 mb-12">
                <p className="font-semibold mb-2">{t.sources}</p>
                <div className="flex flex-wrap gap-2">
                  {data.sourceUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-600 hover:underline bg-white px-2 py-1 rounded border border-slate-200">
                      Source {i + 1} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {isImageModalOpen && data && data.imageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsImageModalOpen(false)}>
           <button className={`absolute top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors ${language === 'ur' ? 'left-4' : 'right-4'}`} onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}>
             <X className="h-8 w-8" />
           </button>
           <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={data.imageUrl} alt={data.name} className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain" />
           </div>
           <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
             <p className="text-white/80 font-medium text-lg">{language === 'en' ? data.name : data.nameUr}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;