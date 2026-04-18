'use client';

import React, { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrescriptionDetail } from '@/src/api/prescription';
import { format } from 'date-fns';
import { 
  Calendar, FileText, ArrowLeft, 
  Printer, Download, Stethoscope, 
  User, Activity, ShieldCheck 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PatientPrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prescriptionId = params.id ? Number(params.id) : 0;

  const contentRef = useRef<HTMLDivElement>(null);

  const { 
    data: prescription, 
    isLoading, 
    isError, 
    error 
  } = usePrescriptionDetail(prescriptionId);

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !prescription) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 3, // Higher scale for crisp text in medical documents
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Medical_Record_${prescription.id}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-black text-blue-400 uppercase tracking-widest animate-pulse">
          Loading_Medical_Data...
        </div>
      </div>
    );
  }

  if (isError || !prescription) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={48} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Record Not Found</h2>
          <p className="text-slate-600 mb-8">This prescription may have been archived or the ID is incorrect.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all"
          >
            Return to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-950 antialiased">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200 sticky top-4 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-black uppercase tracking-tight text-sm text-slate-400">Back_To_History</h2>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              <Download size={16} /> Save PDF
            </button>
          </div>
        </div>

        {/* Prescription Document */}
        <div ref={contentRef} className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-0 print:shadow-none">
          
          {/* Document Top Branding */}
          <div className="bg-slate-950 p-10 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-blue-400" size={24} />
                <span className="font-black tracking-tighter text-xl">HEALTH_CORE</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">Official Medical Prescription</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black tracking-tighter">#{String(prescription.id).padStart(5, '0')}</div>
              <div className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Digital Record</div>
            </div>
          </div>

          <div className="p-10 md:p-16">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <User size={14} /> Patient Information
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{prescription.patientName}</h3>
                  <p className="text-slate-500 font-medium">{prescription.patientEmail}</p>
                </div>
              </div>

              <div className="space-y-4 md:text-right">
                <div className="flex items-center md:justify-end gap-3 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <Stethoscope size={14} /> Issued By
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Dr. {prescription.doctorName}</h3>
                  <div className="flex items-center md:justify-end gap-2 text-blue-600 font-bold text-sm mt-1">
                    <Calendar size={14} />
                    {format(new Date(prescription.prescriptionDate), 'dd MMMM, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {/* Medication Table */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-slate-100"></div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Medication Schedule</h4>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="space-y-4">
                {prescription.items?.map((item, index) => (
                  <div key={item.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border border-slate-100 bg-slate-50/50 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-black shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 uppercase tracking-tight">{item.medicineName}</div>
                        <div className="text-sm text-slate-500 font-medium mt-0.5">{item.instructions || 'Standard Dose'}</div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-8">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dosage</p>
                        <p className="font-bold text-slate-800">{item.dosage || '—'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty</p>
                        <p className="font-bold text-slate-800">x{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {prescription.instructions && (
              <div className="mb-16">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">Clinical Instructions</h4>
                <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-dashed border-blue-100 text-slate-700 leading-relaxed font-medium">
                  {prescription.instructions}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-10 border-t border-slate-100">
              <ShieldCheck size={32} className="text-slate-200" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-xs">
                This document is a verified electronic medical record. Valid without physical signature.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          nav, button, .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}