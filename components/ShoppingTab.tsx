import React, { useState, useRef } from 'react';
import { ShoppingItem } from '../types';
import { Plus, Check, Trash2, Image as ImageIcon } from 'lucide-react';

interface ShoppingTabProps {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
}

export const ShoppingTab: React.FC<ShoppingTabProps> = ({ items, setItems }) => {
  const [newItemName, setNewItemName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      image: tempImage || undefined,
      bought: false
    };
    setItems([...items, newItem]);
    setNewItemName('');
    setTempImage(null);
  };

  const toggleBought = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="px-6 pb-24 min-h-[50vh]">
      <div className="grid grid-cols-2 gap-4 mb-20">
        {items.map(item => (
          <div key={item.id} className={`relative bg-white rounded-2xl p-3 shadow-sm transition-all ${item.bought ? 'opacity-50 grayscale' : ''}`}>
             <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                {item.bought && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Check className="text-white w-10 h-10 drop-shadow-lg" strokeWidth={3} />
                    </div>
                )}
             </div>
             
             <div className="flex justify-between items-start">
                <span className={`text-sm font-bold leading-tight ${item.bought ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.name}
                </span>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={14} />
                </button>
             </div>
             
             <button 
                onClick={() => toggleBought(item.id)}
                className={`w-full mt-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${item.bought ? 'bg-gray-100 text-gray-500' : 'bg-tokyo-red/10 text-tokyo-red'}`}
             >
                {item.bought ? '已購買' : '標記購買'}
             </button>
          </div>
        ))}
      </div>

      {/* Add Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] p-6 z-40">
        <h3 className="font-bold text-gray-800 mb-4">新增願望清單</h3>
        <div className="flex space-x-3">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-300 text-gray-400 overflow-hidden"
           >
              {tempImage ? <img src={tempImage} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
           </button>
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
           />
           <input 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="想買什麼？"
              className="flex-1 bg-gray-50 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-tokyo-red/20 text-gray-900"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
           />
           <button 
             onClick={handleAddItem}
             className="w-12 h-12 flex-shrink-0 bg-tokyo-red text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200"
           >
             <Plus size={24} />
           </button>
        </div>
      </div>
    </div>
  );
};
