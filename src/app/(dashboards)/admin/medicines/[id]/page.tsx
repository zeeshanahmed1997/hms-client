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
  AlertTriangle, 
  Search, 
  Save, 
  Trash2, 
  Package, 
  X, 
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';

export default function MedicinesPageId() {
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
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500 opacity-50" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Navigation & Branding */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">PharmaStock Pro</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live Cloud Sync
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                placeholder="Find medicine by name or generic brand..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-md"
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreateForm ? 'Cancel' : 'Register New Item'}
            </button>
          </div>
        </div>

        {/* Dynamic Alerts Container */}
        {lowStock.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-[1px] rounded-2xl shadow-lg">
            <div className="bg-white rounded-[15px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-bold text-gray-700 underline decoration-red-200 underline-offset-4">
                  {lowStock.length} Items reaching critical stock levels
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        )}

        {/* Expanded Form Section */}
        {showCreateForm && (
          <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" /> New Inventory Entry
            </h2>
            <form onSubmit={handleCreateMedicine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Product Name</label>
                <input className="w-full bg-gray-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" required value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Generic Formula</label>
                <input className="w-full bg-gray-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" value={newMedicine.genericName} onChange={e => setNewMedicine({...newMedicine, genericName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Unit Price (₹)</label>
                <input className="w-full bg-gray-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" type="number" required onChange={e => setNewMedicine({...newMedicine, unitPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Expiry Date</label>
                <input className="w-full bg-gray-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" type="date" required onChange={e => setNewMedicine({...newMedicine, expiryDate: e.target.value})} />
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Submit to Database</button>
              </div>
            </form>
          </div>
        )}

        {/* Master Inventory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-tighter w-[30%]">Medicine & Formula</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-tighter text-center">Current Stock</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-tighter text-center">Pricing</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-tighter">Inventory Update Action</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-blue-50/20 transition-all duration-150 group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                          <Package className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none mb-1">{medicine.name}</p>
                          <p className="text-xs text-gray-400 font-medium tracking-tight italic">{medicine.genericName || 'No formula listed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-black ${medicine.stockQuantity < 20 ? 'text-red-500' : 'text-gray-900'}`}>
                          {medicine.stockQuantity}
                        </span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div className={`h-full ${medicine.stockQuantity < 20 ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${Math.min(medicine.stockQuantity, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                        ₹{medicine.unitPrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-6">
                      <form 
                        className="flex items-center gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const qty = (form.elements.namedItem('qty') as HTMLInputElement).value;
                          handleStockUpdate(medicine.id, Number(qty), 'Table Manual Update');
                          form.reset();
                        }}
                      >
                        <input 
                          name="qty"
                          type="number" 
                          placeholder="+/- Units" 
                          required
                          className="w-24 p-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                        <button 
                          type="submit"
                          className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          <Save className="h-3 w-3" /> Save
                        </button>
                      </form>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleDelete(medicine.id, medicine.name)}
                        className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
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