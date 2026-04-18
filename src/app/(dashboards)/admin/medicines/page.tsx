'use client';

import { 
  useMedicines, 
  useLowStockMedicines, 
  useUpdateStock, 
  useCreateMedicine, 
  useDeleteMedicine 
} from '@/src/api/medicine';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  AlertCircle, 
  Search, 
  Save, 
  Trash2, 
  Package, 
  X, 
  Loader2,
  Activity,
  History,
  TrendingDown
} from 'lucide-react';

export default function MedicinesPage() {
  const { data: medicines = [], isLoading } = useMedicines();
  const { data: lowStock = [] } = useLowStockMedicines();
  const updateStock = useUpdateStock();
  const createMedicine = useCreateMedicine();
  const deleteMedicine = useDeleteMedicine();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '', genericName: '', unitPrice: 0, initialStock: 0, expiryDate: ''
  });

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMedicine.mutateAsync(newMedicine);
      toast.success('Inventory Updated');
      setShowCreateForm(false);
      setNewMedicine({ name: '', genericName: '', unitPrice: 0, initialStock: 0, expiryDate: '' });
    } catch (error) {
      toast.error('Submission Failed');
    }
  };

  const handleStockUpdate = async (id: number, qty: number, reason: string) => {
    if (qty === 0) return toast.error("Quantity required");
    try {
      await updateStock.mutateAsync({ medicineId: id, quantity: qty, reason: reason || 'Adjustment' });
      toast.success('Stock Synced');
    } catch (error) {
      toast.error('Sync Failed');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete ${name} permanently?`)) {
      try {
        await deleteMedicine.mutateAsync(id);
        toast.success('Deleted');
      } catch (error) {
        toast.error('Action Restricted');
      }
    }
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Syncing Database...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* Compact Hospital Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 p-4 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Pharmacy Inventory</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Central Hospital Registry</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                placeholder="Quick search medicines..." 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{showCreateForm ? 'Close' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Package className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Total Items</p>
               <p className="text-lg font-black text-slate-900">{medicines.length}</p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors ${lowStock.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${lowStock.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-400'}`}><TrendingDown className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Low Stock Alert</p>
               <p className={`text-lg font-black ${lowStock.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{lowStock.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center"><History className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">System Status</p>
               <p className="text-lg font-black text-slate-900">Online</p>
            </div>
          </div>
        </div>

        {/* Form Overlay - More compact */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl animate-in fade-in zoom-in-95">
            <form onSubmit={handleCreateMedicine} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Name</label>
                <input className="w-full bg-slate-50 border-none p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" required value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Formula</label>
                <input className="w-full bg-slate-50 border-none p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" value={newMedicine.genericName} onChange={e => setNewMedicine({...newMedicine, genericName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Price</label>
                <input className="w-full bg-slate-50 border-none p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" type="number" required onChange={e => setNewMedicine({...newMedicine, unitPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Expiry</label>
                <input className="w-full bg-slate-50 border-none p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20" type="date" required onChange={e => setNewMedicine({...newMedicine, expiryDate: e.target.value})} />
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Register</button>
              </div>
            </form>
          </div>
        )}

        {/* Master Table - Data Dense */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-tighter">Medicine Detail</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-tighter text-center">In Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-tighter text-center">Unit Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-tighter">Stock Adjustment</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{medicine.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">{medicine.genericName || 'No formula'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-black ${medicine.stockQuantity < 20 ? 'text-red-500' : 'text-slate-700'}`}>
                          {medicine.stockQuantity}
                        </span>
                        <div className="w-8 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                           <div className={`h-full ${medicine.stockQuantity < 20 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(medicine.stockQuantity, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">₹{medicine.unitPrice}</span>
                    </td>
                    <td className="px-6 py-3">
                      <form 
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const qty = (form.elements.namedItem('qty') as HTMLInputElement).value;
                          handleStockUpdate(medicine.id, Number(qty), 'Table Update');
                          form.reset();
                        }}
                      >
                        <input 
                          name="qty"
                          type="number" 
                          placeholder="+/-" 
                          required
                          className="w-16 p-1.5 bg-slate-100 border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500/30 outline-none"
                        />
                        <button 
                          type="submit"
                          className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <Save className="h-3 w-3" />
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(medicine.id, medicine.name)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}