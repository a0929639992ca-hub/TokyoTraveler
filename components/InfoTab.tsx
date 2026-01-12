import React, { useState, useRef } from 'react';
import { FLIGHT_INFOS } from '../constants';
import { Plane, Phone, Car, MapPin, Calculator, ArrowRightLeft, Train, Download, Upload, Database, AlertCircle, ShieldCheck } from 'lucide-react';

interface InfoTabProps {
  exchangeRate: number;
  onImport: (json: string) => void;
  allData: any;
}

export const InfoTab: React.FC<InfoTabProps> = ({ exchangeRate, onImport, allData }) => {
  const [jpyAmount, setJpyAmount] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `tokyo_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => onImport(event.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="px-6 pb-24 space-y-6 animate-fade-in">
      
      {/* Auto-Save Assurance Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-green-50 flex items-center space-x-4">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 flex-shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">自動同步已啟用</h3>
          <p className="text-[10px] text-gray-400 leading-tight">您的行程與花費會在每次更動後即時儲存於此瀏覽器中，無須手動存檔。</p>
        </div>
      </div>

      {/* Rate Converter */}
      <div className="bg-gradient-to-br from-gray-800 to-black text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4 opacity-80">
          <Calculator size={18} />
          <span className="text-sm font-medium">匯率換算 (1 JPY ≈ {exchangeRate.toFixed(3)} TWD)</span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
             <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">JPY 日幣</label>
             <input 
                type="number" 
                value={jpyAmount}
                onChange={(e) => setJpyAmount(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold border-b border-white/20 focus:outline-none py-1 placeholder-white/20"
                placeholder="0"
             />
          </div>
          <ArrowRightLeft className="text-white/40" />
          <div className="flex-1 text-right">
             <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">TWD 台幣</label>
             <div className="text-3xl font-bold text-tokyo-red py-1">
                {jpyAmount ? (Number(jpyAmount) * exchangeRate).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
             </div>
          </div>
        </div>
      </div>

      {/* Data Management (As Failsafe) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
         <div className="flex items-center space-x-2 mb-4">
            <Database className="text-gray-400" size={18} />
            <h2 className="text-base font-bold text-gray-700">手動資料管理 (備援)</h2>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold active:bg-gray-100">
               <Download size={14} /> <span>下載備份</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold active:bg-gray-100">
               <Upload size={14} /> <span>匯入還原</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
         </div>
      </div>

      {/* Flights */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center"><Plane className="mr-2 text-tokyo-red" size={20}/> 航班資訊</h2>
        <div className="space-y-6">
           {FLIGHT_INFOS.map((flight, idx) => (
             <div key={idx} className="relative pl-4 border-l-2 border-dashed border-gray-200">
               <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
               <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{flight.type === 'OUTBOUND' ? '去程' : '回程'}</span>
                 <span className="text-xs text-gray-400">{flight.duration}</span>
               </div>
               <div className="flex justify-between items-center mb-1">
                  <span className="text-2xl font-bold">{flight.departureTime}</span>
                  <div className="h-px bg-gray-300 flex-1 mx-3 relative">
                     <Plane size={12} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-gray-400 rotate-90" />
                  </div>
                  <span className="text-2xl font-bold">{flight.arrivalTime}</span>
               </div>
               <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>{flight.airportCode.split('->')[0].trim()}</span>
                  <span className="font-mono">{flight.flightNumber}</span>
                  <span>{flight.airportCode.split('->')[1].trim()}</span>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* Hotel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
         <h2 className="text-lg font-bold mb-4 flex items-center"><MapPin className="mr-2 text-tokyo-red" size={20}/> 住宿資訊</h2>
         <div className="space-y-1">
            <h3 className="font-bold text-gray-800">上野斯特拉飯店</h3>
            <p className="text-xs text-gray-500">〒110-0005 東京都台東区上野７丁目１−１</p>
            <p className="text-xs text-gray-500 font-mono">+81 3-5806-1200</p>
            <a href="https://maps.google.com/?q=Hotel+Sunroute+Stella+Ueno" target="_blank" className="block w-full text-center py-2.5 mt-3 bg-tokyo-red/5 text-tokyo-red rounded-xl text-sm font-bold active:bg-tokyo-red/10">
               在 Google 地圖中開啟
            </a>
         </div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 pb-10">
         <AlertCircle size={10} />
         <span>系統將優先讀取您瀏覽器中的自訂行程</span>
      </div>
    </div>
  );
};