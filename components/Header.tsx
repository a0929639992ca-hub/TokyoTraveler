import React, { useRef, useState } from 'react';
import { TabType } from '../types';
import { MapPin, Info, ShoppingBag, Coins, Camera } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [bannerImage, setBannerImage] = useState<string>('https://picsum.photos/1920/400');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBannerImage(imageUrl);
    }
  };

  const navItems: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'ITINERARY', icon: <MapPin size={20} />, label: '行程' },
    { id: 'INFO', icon: <Info size={20} />, label: '資訊' },
    { id: 'SHOPPING', icon: <ShoppingBag size={20} />, label: '購物' },
    { id: 'EXPENSES', icon: <Coins size={20} />, label: '花費' },
  ];

  return (
    <div className="relative z-50">
      {/* Banner Area */}
      <div className="relative h-[250px] w-full overflow-hidden bg-gray-200">
        <img 
          src={bannerImage} 
          alt="Trip Banner" 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition"
        >
          <Camera size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
        
        {/* Title Overlay */}
        <div className="absolute top-10 left-6 text-white drop-shadow-md">
          <h1 className="text-3xl font-bold tracking-widest">東京</h1>
          <p className="text-sm font-light tracking-wider opacity-90">2026 旅行</p>
        </div>

        {/* Floating Navigation Tabs */}
        <div className="absolute bottom-10 right-4 flex space-x-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                activeTab === item.id 
                  ? 'bg-tokyo-red text-white' 
                  : 'bg-white/80 text-tokyo-dark'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Curved Connector */}
      <div className="relative -mt-8 h-8 bg-tokyo-gray rounded-t-[30px] w-full z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"></div>
    </div>
  );
};
