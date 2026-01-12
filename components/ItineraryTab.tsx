import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DaySchedule, ItineraryItem, ItineraryType, TransportType, CATEGORY_LABELS } from '../types';
import { Plus, MapPin, Footprints, Car, Train, Trash2, Navigation, Accessibility, Loader2, ChevronUp, ChevronDown, RefreshCw, AlertCircle, XCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface ItineraryTabProps {
  schedule: DaySchedule[];
  setSchedule: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
}

const LINE_COLORS: Record<string, string> = {
  'G': 'bg-[#F39700]', 'M': 'bg-[#E60012]', 'H': 'bg-[#9CAEB7]', 'T': 'bg-[#00A7DB]',
  'C': 'bg-[#009944]', 'Y': 'bg-[#D7C447]', 'Z': 'bg-[#8BB2D0]', 'N': 'bg-[#00AC9B]',
  'F': 'bg-[#9C5E31]', 'E': 'bg-[#B6007A]', 'A': 'bg-[#E85298]', 'I': 'bg-[#009BBF]',
  'S': 'bg-[#B0CA71]', 'JR': 'bg-[#80C241]', 'KS': 'bg-[#00549F]',
};

// Helper to clean JSON string from AI response
const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

const LineBadge: React.FC<{ raw: string }> = ({ raw }) => {
  const parts = raw.split(' ');
  const code = parts[0];
  const name = parts.slice(1).join(' ');
  const colorClass = LINE_COLORS[code] || 'bg-gray-500';
  return (
    <div className="flex items-center space-x-1 mr-2 my-0.5">
      <span className={`flex items-center justify-center w-5 h-5 text-[9px] font-bold text-white rounded-full ${colorClass} shadow-sm border border-white/20`}>
        {code}
      </span>
      <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{name}</span>
    </div>
  );
};

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ schedule, setSchedule }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  
  const pendingRequests = useRef<Set<string>>(new Set());
  const currentDay = schedule[selectedDayIndex];

  const fetchTransportFromAI = async (from: string, to: string) => {
    // Check if API key is available
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Critical: API_KEY is missing from process.env. Check Vercel settings.");
      return null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a Tokyo local transport expert. Provide the best route from "${from}" to "${to}".
                   STRICT RULES:
                   1. Use JAPANESE (Kanji/Kana) for all Station names and Line names.
                   2. Return JSON ONLY: type(TRAIN, WALK, CAR), durationMinutes(number), details(string).
                   3. Details Format: "[LineCode LineName] Station -> Station | Exit/Transfer Info".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["TRAIN", "WALK", "CAR"] },
              durationMinutes: { type: Type.NUMBER },
              details: { type: Type.STRING }
            },
            required: ["type", "durationMinutes", "details"]
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      
      const cleanedText = cleanJsonString(text);
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("AI Request Failed:", e);
      return null;
    }
  };

  const updateTransportForIndex = useCallback(async (idx: number, dayIdx: number) => {
    const day = schedule[dayIdx];
    const items = day.items;
    if (idx < 0 || idx >= items.length - 1) return;

    const fromItem = items[idx];
    const toItem = items[idx + 1];
    const requestId = `${fromItem.id}-${toItem.id}`;

    if (pendingRequests.current.has(requestId)) return;
    
    pendingRequests.current.add(requestId);
    setLoadingIds(prev => new Set(prev).add(fromItem.id));
    setErrorIds(prev => {
        const next = new Set(prev);
        next.delete(fromItem.id);
        return next;
    });
    
    try {
      const data = await fetchTransportFromAI(fromItem.name, toItem.name);
      if (data && data.type) {
        setSchedule(prev => prev.map((d, dIdx) => {
          if (dIdx !== dayIdx) return d;
          return {
            ...d,
            items: d.items.map(it => it.id === fromItem.id ? {
              ...it,
              transportToNext: {
                type: data.type,
                durationMinutes: data.durationMinutes || 15,
                details: data.details || '路線規劃完成'
              }
            } : it)
          };
        }));
      } else {
        setErrorIds(prev => new Set(prev).add(fromItem.id));
      }
    } catch (e) {
      setErrorIds(prev => new Set(prev).add(fromItem.id));
    } finally {
      pendingRequests.current.delete(requestId);
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(fromItem.id);
        return next;
      });
    }
  }, [schedule, setSchedule]);

  useEffect(() => {
    const dayItems = currentDay.items;
    let anyRequestSent = false;
    
    for (let i = 0; i < dayItems.length - 1; i++) {
      const item = dayItems[i];
      if (!item.transportToNext && !loadingIds.has(item.id) && !errorIds.has(item.id)) {
        const timer = setTimeout(() => {
          updateTransportForIndex(i, selectedDayIndex);
        }, 1000 + (i * 200)); // Stagger requests to avoid rate limits
        anyRequestSent = true;
        return () => clearTimeout(timer);
      }
    }
  }, [currentDay.items, selectedDayIndex, updateTransportForIndex, loadingIds, errorIds]);

  const handleSaveItem = (item: ItineraryItem) => {
    setSchedule(prev => prev.map((day, idx) => {
      if (idx !== selectedDayIndex) return day;
      let newItems = [...day.items];
      const isAdding = !editingItem;
      
      if (isAdding) newItems.push(item);
      else newItems = newItems.map(i => i.id === item.id ? { ...item, transportToNext: undefined } : i);
      
      newItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      return { ...day, items: newItems.map((it, i) => {
          // If the item sequence changed, we reset it
          return it;
      })};
    }));
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (!window.confirm('確定要刪除此行程嗎？')) return;
    setSchedule(prev => prev.map((day, idx) => {
      if (idx !== selectedDayIndex) return day;
      return { ...day, items: day.items.filter(i => i.id !== id) };
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= currentDay.items.length) return;

    const newItems = [...currentDay.items];
    newItems[index] = { ...newItems[index], transportToNext: undefined };
    if (index > 0) newItems[index-1] = { ...newItems[index-1], transportToNext: undefined };
    if (target > 0) newItems[target-1] = { ...newItems[target-1], transportToNext: undefined };
    
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];

    setSchedule(prev => prev.map((day, idx) => {
      if (idx !== selectedDayIndex) return day;
      return { ...day, items: newItems };
    }));
    setErrorIds(new Set()); // Clear errors to allow re-calc
  };

  const renderTransportDetails = (details: string) => {
    const parts = details.split(/(\[.*?\])/g);
    return (
      <div className="flex flex-wrap items-center text-[10px] leading-relaxed w-full">
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) return <LineBadge key={i} raw={part.slice(1, -1)} />;
          if (part.includes('|')) {
             const [route, info] = part.split('|');
             return (
               <React.Fragment key={i}>
                 <span className="text-gray-600 mr-2">{route}</span>
                 {info && (
                    <div className="flex items-center bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100 mt-0.5">
                        <Accessibility size={10} className="mr-1"/>
                        <span className="font-medium">{info.trim()}</span>
                    </div>
                 )}
               </React.Fragment>
             );
          }
          return <span key={i} className="text-gray-500 mr-1">{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="pb-24 relative">
      <div className="flex overflow-x-auto no-scrollbar space-x-4 px-6 pb-4 mb-2">
        {schedule.map((day, idx) => (
          <button key={day.id} onClick={() => setSelectedDayIndex(idx)} className={`flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-2xl transition-all ${selectedDayIndex === idx ? 'bg-tokyo-red text-white shadow-lg shadow-red-200 scale-105' : 'bg-white text-gray-400'}`}>
            <span className="text-xl font-bold">{day.dayOfWeek}</span>
            <span className="text-xs font-medium">{day.date}</span>
          </button>
        ))}
      </div>

      <div className="px-6 space-y-0 relative mt-4">
        <div className="absolute left-[29px] top-4 bottom-10 w-0.5 bg-gray-200 -z-10"></div>
        {currentDay.items.map((item, idx) => (
          <div key={item.id} className="relative group mb-0">
            {idx > 0 && (
               <div className="py-2 pl-16 flex flex-col justify-center min-h-[60px]">
                  {loadingIds.has(currentDay.items[idx-1].id) ? (
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 animate-pulse bg-white/50 py-3 px-4 rounded-xl border border-dashed border-gray-200">
                          <Loader2 size={12} className="animate-spin text-tokyo-red"/>
                          <span className="font-medium">AI 正在規劃日文路線...</span>
                      </div>
                  ) : errorIds.has(currentDay.items[idx-1].id) ? (
                      <div className="flex items-center space-x-2 text-[10px] text-red-400 bg-red-50 py-2 px-4 rounded-xl border border-red-100">
                          <XCircle size={12} />
                          <span className="font-medium">規劃失敗</span>
                          <button onClick={() => updateTransportForIndex(idx - 1, selectedDayIndex)} className="ml-2 font-bold underline active:scale-95 transition-transform">重試</button>
                      </div>
                  ) : currentDay.items[idx - 1].transportToNext ? (
                      <div className="flex flex-col items-start gap-1 animate-fade-in">
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] text-gray-600 font-bold mb-1">
                            {currentDay.items[idx - 1].transportToNext?.type === 'WALK' ? <Footprints size={12}/> : <Train size={12}/>}
                            <span>{currentDay.items[idx - 1].transportToNext!.durationMinutes} 分鐘</span>
                        </div>
                        <div className="bg-white/95 p-3 rounded-xl border border-gray-100 w-full shadow-sm hover:border-tokyo-red/30 transition-all">
                            {renderTransportDetails(currentDay.items[idx - 1].transportToNext!.details || '')}
                        </div>
                      </div>
                  ) : (
                      <div className="flex items-center space-x-2 text-[9px] text-gray-300 italic py-2">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce"></div>
                        <span>等待自動規劃中...</span>
                      </div>
                  )}
               </div>
            )}
            
            {idx === 0 && <div className="h-8 flex items-center pl-16 mb-2 text-[10px] text-gray-400 font-bold tracking-widest">START</div>}

            <div className="flex items-start">
               <div className="w-14 pt-1 flex flex-col items-center mr-2 z-10">
                 <span className="text-sm font-bold text-gray-800">{item.startTime}</span>
                 {item.endTime && <span className="text-[10px] text-gray-400">{item.endTime}</span>}
               </div>

               <div className={`flex-1 rounded-2xl p-4 shadow-sm border border-gray-100 relative bg-white transition-all hover:translate-x-1 ${item.type === 'FLIGHT' ? 'bg-blue-50 border-blue-200' : ''}`}>
                 <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveItem(idx, 'up')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronUp size={16} /></button>
                    <button onClick={() => moveItem(idx, 'down')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronDown size={16} /></button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={16} /></button>
                 </div>

                 <div onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="cursor-pointer">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white mb-2 inline-block shadow-sm ${item.type === 'SIGHTSEEING' ? 'bg-tokyo-red' : item.type === 'FOOD' ? 'bg-orange-400' : 'bg-gray-400'}`}>{CATEGORY_LABELS[item.type]}</span>
                    <h3 className="font-bold text-gray-900 mb-1 text-base leading-tight">{item.name}</h3>
                    {item.notes && <p className="text-xs text-gray-500 mb-1 line-clamp-1">{item.notes}</p>}
                 </div>
                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`} target="_blank" className="absolute bottom-4 right-4 bg-tokyo-red/10 text-tokyo-red p-2.5 rounded-full active:scale-90 hover:bg-tokyo-red/20 transition-colors"><Navigation size={18} /></a>
               </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-tokyo-red text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform active:scale-90"><Plus size={28} /></button>

      {isModalOpen && <ItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} onDelete={handleDeleteItem} initialData={editingItem} />}
    </div>
  );
};

const ItemModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (item: ItineraryItem) => void; onDelete: (id: string) => void; initialData: ItineraryItem | null; }> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [formData, setFormData] = useState<Partial<ItineraryItem>>(initialData || { type: 'SIGHTSEEING', name: '', startTime: '10:00', notes: '' });
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{initialData ? '編輯行程' : '新增行程'}</h3><button onClick={() => initialData && onDelete(initialData.id)} className="text-red-400 p-2"><Trash2 size={20} /></button></div>
                <div className="space-y-4">
                    <label className="text-xs text-gray-400 block mb-1 font-bold">類型</label>
                    <select className="w-full bg-gray-50 rounded-xl p-3 text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ItineraryType})}>{Object.entries(CATEGORY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <label className="text-xs text-gray-400 block mb-1 font-bold">名稱</label>
                    <input className="w-full bg-gray-50 rounded-xl p-3 text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如: 晴空塔" />
                    <div className="flex space-x-4">
                        <div className="flex-1"><label className="text-xs text-gray-400 block mb-1 font-bold">開始時間</label><input type="time" className="w-full bg-gray-50 rounded-xl p-3 text-sm" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}/></div>
                        <div className="flex-1"><label className="text-xs text-gray-400 block mb-1 font-bold">門票 (¥)</label><input type="number" className="w-full bg-gray-50 rounded-xl p-3 text-sm" value={formData.ticketPrice || ''} onChange={e => setFormData({...formData, ticketPrice: Number(e.target.value)})} placeholder="0"/></div>
                    </div>
                    <label className="text-xs text-gray-400 block mb-1 font-bold">備註</label>
                    <textarea className="w-full bg-gray-50 rounded-xl p-3 text-sm h-20 resize-none" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="特色、清單..." />
                </div>
                <div className="flex space-x-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-500 font-medium">取消</button>
                    <button onClick={() => onSave({ ...formData, id: initialData?.id || Date.now().toString() } as ItineraryItem)} className="flex-1 py-3 bg-tokyo-red text-white rounded-xl font-bold">儲存</button>
                </div>
            </div>
        </div>
    );
};