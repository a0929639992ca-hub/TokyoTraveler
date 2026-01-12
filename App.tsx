import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ItineraryTab } from './components/ItineraryTab';
import { InfoTab } from './components/InfoTab';
import { ShoppingTab } from './components/ShoppingTab';
import { ExpensesTab } from './components/ExpensesTab';
import { TabType, DaySchedule, ExpenseItem, ShoppingItem } from './types';
import { INITIAL_SCHEDULE } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ITINERARY');
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Schedule State with Robust Persistence
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('tokyo_schedule_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse schedule", e);
      }
    }
    return INITIAL_SCHEDULE;
  });

  // 2. Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('tokyo_expenses_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Shopping State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('tokyo_shopping_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [exchangeRate, setExchangeRate] = useState<number>(0.205);

  // Mark as loaded to prevent INITIAL_SCHEDULE overwriting storage during first empty render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Effects: Sync to LocalStorage (Use versioned keys to avoid conflicts with old builds)
  useEffect(() => {
    if (isLoaded) localStorage.setItem('tokyo_schedule_v2', JSON.stringify(schedule));
  }, [schedule, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('tokyo_expenses_v2', JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('tokyo_shopping_v2', JSON.stringify(shoppingList));
  }, [shoppingList, isLoaded]);

  // Fetch Exchange Rate (JPY -> TWD)
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        const data = await res.json();
        if (data && data.rates && data.rates.TWD) {
          // Force to 3 decimal precision
          setExchangeRate(parseFloat(data.rates.TWD.toFixed(3)));
        }
      } catch (error) {
        console.warn("Failed to fetch exchange rate, using 0.205 default.");
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
      alert('匯入失敗，請檢查檔案格式。');
    }
  };

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
      <main className="max-w-md mx-auto relative z-0">
        <div className="mt-6 animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;