import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { ItineraryTab } from './components/ItineraryTab';
import { InfoTab } from './components/InfoTab';
import { ShoppingTab } from './components/ShoppingTab';
import { ExpensesTab } from './components/ExpensesTab';
import { TabType, DaySchedule, ExpenseItem, ShoppingItem } from './types';
import { INITIAL_SCHEDULE } from './constants';

const STORAGE_KEY = 'TOKYO_TRAVELER_MASTER_DATA';
const OLD_KEYS = ['tokyo_schedule_v2', 'tokyo_expenses_v2', 'tokyo_shopping_v2'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ITINERARY');
  const [isReady, setIsReady] = useState(false);
  
  // Master State
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0.205);

  // 1. Data Hydration & Migration Logic
  useLayoutEffect(() => {
    const loadData = () => {
      const savedMaster = localStorage.getItem(STORAGE_KEY);
      
      if (savedMaster) {
        try {
          const parsed = JSON.parse(savedMaster);
          if (parsed.schedule) setSchedule(parsed.schedule);
          if (parsed.expenses) setExpenses(parsed.expenses);
          if (parsed.shopping) setShoppingList(parsed.shopping);
          console.log("Auto-loaded from Master Storage");
        } catch (e) {
          console.error("Master storage corrupted", e);
        }
      } else {
        // Try to migrate from old version keys if Master doesn't exist
        const oldSchedule = localStorage.getItem('tokyo_schedule_v2');
        const oldExpenses = localStorage.getItem('tokyo_expenses_v2');
        const oldShopping = localStorage.getItem('tokyo_shopping_v2');

        if (oldSchedule || oldExpenses || oldShopping) {
          console.log("Migrating data from previous version...");
          if (oldSchedule) setSchedule(JSON.parse(oldSchedule));
          if (oldExpenses) setExpenses(JSON.parse(oldExpenses));
          if (oldShopping) setShoppingList(JSON.parse(oldShopping));
        }
      }
      setIsReady(true);
    };

    loadData();
  }, []);

  // 2. Automatic Persistence Effect
  useEffect(() => {
    if (isReady) {
      const masterData = {
        schedule,
        expenses,
        shopping: shoppingList,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(masterData));
      // Cleanup old keys to save space after migration
      OLD_KEYS.forEach(key => localStorage.removeItem(key));
    }
  }, [schedule, expenses, shoppingList, isReady]);

  // 3. Fetch Exchange Rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        const data = await res.json();
        if (data?.rates?.TWD) {
          setExchangeRate(parseFloat(data.rates.TWD.toFixed(3)));
        }
      } catch (error) {
        console.warn("Using default rate 0.205");
      }
    };
    fetchRate();
  }, []);

  const handleImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.schedule) setSchedule(data.schedule);
      if (data.expenses) setExpenses(data.expenses);
      if (data.shopping) setShoppingList(data.shopping);
      alert('資料匯入成功！');
    } catch (e) {
      alert('匯入失敗');
    }
  };

  if (!isReady) return null; // Prevent flicker

  const renderContent = () => {
    switch (activeTab) {
      case 'ITINERARY':
        return <ItineraryTab schedule={schedule} setSchedule={setSchedule} />;
      case 'INFO':
        return (
          <InfoTab 
            exchangeRate={exchangeRate} 
            onImport={handleImportData}
            allData={{ schedule, expenses, shopping: shoppingList }}
          />
        );
      case 'SHOPPING':
        return <ShoppingTab items={shoppingList} setItems={setShoppingList} />;
      case 'EXPENSES':
        return <ExpensesTab expenses={expenses} setExpenses={setExpenses} exchangeRate={exchangeRate} />;
      default:
        return <ItineraryTab schedule={schedule} setSchedule={setSchedule} />;
    }
  };

  return (
    <div className="min-h-screen bg-tokyo-gray font-sans pb-10">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Auto-save Indicator */}
      <div className="max-w-md mx-auto px-6 -mt-4 mb-2 flex justify-end">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Local Auto-Save Active</span>
        </div>
      </div>
      <main className="max-w-md mx-auto relative z-0">
        <div className="mt-2 animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;