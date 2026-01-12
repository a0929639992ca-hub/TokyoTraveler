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

  // 1. Schedule State with LocalStorage
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('tokyo_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  // 2. Expenses State with LocalStorage
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('tokyo_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Shopping State with LocalStorage
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('tokyo_shopping');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Real-time Exchange Rate State
  const [exchangeRate, setExchangeRate] = useState<number>(0.21); // Default fallback

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('tokyo_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('tokyo_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('tokyo_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Fetch Exchange Rate (JPY -> TWD)
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Using a reliable free API for real-time rates
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        const data = await res.json();
        if (data && data.rates && data.rates.TWD) {
          setExchangeRate(data.rates.TWD);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate, using default.", error);
      }
    };
    fetchRate();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'ITINERARY':
        return <ItineraryTab schedule={schedule} setSchedule={setSchedule} />;
      case 'INFO':
        return <InfoTab exchangeRate={exchangeRate} />;
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
