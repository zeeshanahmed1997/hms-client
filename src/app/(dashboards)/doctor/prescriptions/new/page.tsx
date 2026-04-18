'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMedicines } from '@/src/api/medicine';
import { useCreatePrescription } from '@/src/api/prescription';
import { toast } from 'react-hot-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchPatientsByDoctorApi } from '@/src/api/users';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Hooks for data fetching
  const { data: medicines = [] } = useMedicines();
  const createMutation = useCreatePrescription();

  // 1. Fetch patients list using the doctor's User ID
  const { data: patientsResponse, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: () => fetchPatientsByDoctorApi(
      token as string, 
      typeof user?.id === 'number' ? user.id : Number(user?.id)
    ),
    enabled: !!user?.id && !!token,
  });

  const patientList = patientsResponse?.data || [];

  // 2. Form State
  const [form, setForm] = useState({
    patientId: 0,
    prescriptionDate: new Date().toISOString().split('T')[0],
    notes: '', // This is the local UI state for instructions
    items: [{ medicineId: 0, quantity: 1, dosage: '', instructions: '' }] as any[],
  });

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { medicineId: 0, quantity: 1, dosage: '', instructions: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (form.patientId === 0) {
      toast.error("Please select a patient");
      return;
    }

    if (form.items.some((item) => item.medicineId === 0)) {
      toast.error("Please select medicine for all rows");
      return;
    }

    // 3. Construct Payload to match C# CreatePrescriptionRequest exactly
    const payload = {
      doctorId: typeof user?.id === 'number' ? user.id : Number(user?.id),
      patientId: form.patientId,
      prescriptionDate: form.prescriptionDate,
      instructions: form.notes, // Mapping 'notes' UI state to 'instructions' DTO field
      items: form.items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        dosage: item.dosage,
        instructions: item.instructions || "" // Ensuring sub-items also have instructions field
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success("Prescription created successfully!");
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      router.push('/doctor/prescriptions');
    } catch (err: any) {
      toast.error(err.message || "Failed to create prescription");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Prescription</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Select Patient</label>
            <select
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            >
              <option value={0}>
                {isLoadingPatients ? "Loading patients..." : "Choose a patient..."}
              </option>
              {patientList.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Prescription Date</label>
            <input
              type="date"
              value={form.prescriptionDate}
              onChange={(e) => setForm({ ...form, prescriptionDate: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Instructions/Notes */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-gray-700">Notes / Special Instructions</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Add general instructions for the patient..."
          />
        </div>

        {/* Prescription Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">Medicines</h3>
            <button 
              type="button" 
              onClick={addItem} 
              className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-1 transition-colors"
            >
              + ADD MEDICINE
            </button>
          </div>

          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 border border-gray-200 p-5 rounded-xl bg-gray-50 items-start">
              {/* Medicine Select */}
              <div className="col-span-12 md:col-span-5">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Medicine Name</label>
                <select
                  value={item.medicineId}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[index].medicineId = Number(e.target.value);
                    setForm({ ...form, items: newItems });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  required
                >
                  <option value={0}>Select Medicine</option>
                  {medicines.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (PKR {m.unitPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-4 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[index].quantity = Number(e.target.value);
                    setForm({ ...form, items: newItems });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                />
              </div>

              {/* Dosage */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Dosage / Timing</label>
                <input
                  type="text"
                  value={item.dosage}
                  onChange={(e) => {
                    const newItems = [...form.items];
                    newItems[index].dosage = e.target.value;
                    setForm({ ...form, items: newItems });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  placeholder="e.g. 1 tab after breakfast"
                />
              </div>

              {/* Delete Action */}
              <div className="col-span-2 md:col-span-1 flex justify-center pt-6">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  disabled={form.items.length === 1}
                >
                  <span className="text-sm font-bold">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Final Submit */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
          >
            {createMutation.isPending ? 'PROCESSING...' : 'SAVE & ISSUE PRESCRIPTION'}
          </button>
        </div>
      </form>
    </div>
  );
}