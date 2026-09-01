import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getShoppingList, addShoppingItem, toggleShoppingItem, deleteShoppingItem } from '../services/shoppingService';
import type { ShoppingItem } from '../services/shoppingService';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const ShoppingList: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    if (!currentUser) return;
    try {
      const data = await getShoppingList(currentUser.uid);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentUser]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !currentUser) return;
    
    try {
      await addShoppingItem({
        userId: currentUser.uid,
        name: newItemName.trim(),
        completed: false
      });
      setNewItemName('');
      fetchList();
    } catch (e) {
      alert("Failed to add item");
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    try {
      // Optimistic update
      setItems(items.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
      await toggleShoppingItem(item.id!, !item.completed);
    } catch (e) {
      fetchList(); // revert on failure
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setItems(items.filter(i => i.id !== id));
      await deleteShoppingItem(id);
    } catch (e) {
      fetchList();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <ShoppingCart size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Shopping List</h2>
          <p className="text-slate-500">Items you need to buy</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex space-x-2">
        <input 
          type="text" 
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          placeholder="Add something to buy..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus size={20} />
          <span className="hidden md:inline">Add</span>
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-center text-slate-500 my-8">Loading list...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 my-12">
            <ShoppingCart size={48} className="text-slate-300" />
            <p className="text-slate-500">Your shopping list is empty!</p>
          </div>
        ) : (
          items.sort((a, b) => Number(a.completed) - Number(b.completed)).map(item => (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => handleToggle(item)}>
                {item.completed ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <Circle size={24} className="text-slate-300" />
                )}
                <span className={`font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.name}
                </span>
              </div>
              <button onClick={() => handleDelete(item.id!)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
