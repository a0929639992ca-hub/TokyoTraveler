import React, { useState, useRef } from 'react';
import { ExpenseItem, EXPENSE_CATEGORY_LABELS } from '../types';
import { Plus, CreditCard, Banknote, Trash2, PieChart, Camera, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

interface ExpensesTabProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  exchangeRate: number;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ expenses, setExpenses, exchangeRate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const totalJpy = expenses.reduce((sum, item) => sum + item.amountJpy, 0);
  const totalTwd = Math.floor(totalJpy * exchangeRate);

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆花費紀錄嗎？')) {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleAdd = (item: Omit<ExpenseItem, 'id'>) => {
    setExpenses(prev => [...prev, { ...item, id: Date.now().toString() }]);
    setIsModalOpen(false);
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Total Card */}
      <div className="px-6 mb-6">
        <div className="bg-black text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
           <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <p className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest font-bold">總花費概覽 (匯率 {exchangeRate.toFixed(3)})</p>
           <div className="flex items-baseline space-x-1">
             <span className="text-lg font-light">JPY</span>
             <span className="text-4xl font-bold tracking-tighter">{totalJpy.toLocaleString()}</span>
           </div>
           <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">估計台幣</span>
                <span className="text-lg font-bold text-tokyo-red tracking-tight">NT$ {totalTwd.toLocaleString()}</span>
             </div>
             <PieChart className="text-gray-600" size={24} />
           </div>
        </div>
      </div>

      {/* List */}
      <div className="px-6 space-y-3">
        {expenses.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm italic">
                還沒有任何紀錄，按右下角按鈕開始。
            </div>
        )}
        {[...expenses].reverse().map(item => (
           <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between group relative border border-transparent hover:border-tokyo-red/20 transition-all">
              <div className="flex items-center space-x-3">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                     item.category === 'FOOD' ? 'bg-orange-50 text-orange-500' :
                     item.category === 'SHOPPING' ? 'bg-purple-50 text-purple-500' :
                     item.category === 'TRANSPORT' ? 'bg-blue-50 text-blue-500' :
                     'bg-gray-50 text-gray-400'
                 }`}>
                    {item.paymentMethod === 'CARD' ? <CreditCard size={20}/> : <Banknote size={20}/>}
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{item.date} · {EXPENSE_CATEGORY_LABELS[item.category]}</p>
                 </div>
              </div>
              <div className="text-right mr-10">
                 <p className="font-bold text-gray-900 text-base">¥{item.amountJpy.toLocaleString()}</p>
                 <p className="text-[10px] text-gray-400 font-medium">NT$ {(item.amountJpy * exchangeRate).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 p-2 transition-all opacity-40 group-hover:opacity-100"><Trash2 size={18} /></button>
           </div>
        ))}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform active:scale-90"><Plus size={28} /></button>
      {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onSave={handleAdd} />}
    </div>
  );
};

const AddExpenseModal: React.FC<{ onClose: () => void; onSave: (item: Omit<ExpenseItem, 'id'>) => void; }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState({ name: '', amount: '', category: 'FOOD' as ExpenseItem['category'], paymentMethod: 'CASH' as ExpenseItem['paymentMethod'], date: new Date().toISOString().split('T')[0].slice(5).replace('-', '/') });
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsScanning(true);
        try {
            const base64Data = await fileToBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: "Analyze this Japanese receipt. Return JSON: merchantName, amount (as number), date (MM/DD), category." }] },
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { merchantName: { type: Type.STRING }, amount: { type: Type.NUMBER }, date: { type: Type.STRING }, category: { type: Type.STRING } } } }
            });
            const result = JSON.parse(response.text || '{}');
            if (result) setForm(prev => ({ ...prev, name: result.merchantName || prev.name, amount: result.amount ? String(result.amount) : prev.amount, date: result.date || prev.date, category: result.category || prev.category }));
        } catch (error) { alert("辨識失敗，請嘗試手動輸入。"); } finally { setIsScanning(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-900">新增花費</h3>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="flex items-center space-x-2 text-xs font-bold bg-tokyo-red/10 text-tokyo-red px-4 py-2 rounded-full active:scale-95 transition-all">
                        {isScanning ? <Loader2 size={16} className="animate-spin"/> : <Camera size={16} />}
                        <span>{isScanning ? '正在辨識日文收據...' : '掃描收據'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
                </div>
                <div className="space-y-4">
                    <div className="flex space-x-3">
                         <div className="flex-1">
                             <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-widest">金額 (JPY)</label>
                             <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-tokyo-red/20 outline-none" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/>
                         </div>
                         <div className="w-1/3">
                             <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-widest">日期</label>
                             <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-center font-bold text-gray-900 outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/>
                         </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-widest">品項/商店名稱</label>
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none" placeholder="例如: 松屋、藥妝店" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
                    </div>
                </div>
                <div className="mt-10 flex space-x-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl text-gray-500 font-bold transition-all active:bg-gray-200">取消</button>
                    <button onClick={() => { if (!form.name || !form.amount) return; onSave({ name: form.name, amountJpy: Number(form.amount), category: form.category, paymentMethod: form.paymentMethod, date: form.date }); }} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-300 transition-all active:scale-[0.98]">儲存紀錄</button>
                </div>
            </div>
        </div>
    );
};