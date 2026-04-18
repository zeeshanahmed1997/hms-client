'use client';

import React, { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrescriptionDetail } from '@/src/api/prescription';
import { format } from 'date-fns';
import { 
  HeartPulse, Calendar, Mail, Phone, 
  FileText, ArrowLeft, Printer, Download 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrescriptionDetailPage() {
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

  // Download PDF Function
const handleDownloadPDF = async () => {
  if (!contentRef.current || !prescription) {
    alert('No content available to generate PDF');
    return;
  }

  try {
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,                    // Good quality vs performance balance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,              // Change to true only when debugging
      width: contentRef.current.scrollWidth,
      height: contentRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;

    // Center the content horizontally
    const xOffset = (pdfWidth - finalWidth) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
    pdf.save(`Prescription_${prescription.id || Date.now()}.pdf`);

  } catch (err) {
    console.error('PDF Generation Error:', err);
    alert('Failed to generate PDF. Please try again or check console.');
  }
};

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Loading_Prescription_Details...
        </div>
      </div>
    );
  }

  if (isError || !prescription) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <FileText size={48} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-rose-500 mb-2">Prescription Not Found</h2>
          <p className="text-slate-600 mb-8">
            {error?.message || "The prescription you're looking for could not be loaded."}
          </p>
          <button 
            onClick={() => router.back()}
            className="bg-slate-950 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold transition-all"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-950 antialiased">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => router.back()}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <ArrowLeft size={26} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-200">
                  <FileText size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    Prescription_Details
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                    #{String(prescription.id).slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all text-sm font-medium"
              >
                <Printer size={18} />
                Print
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all text-sm font-medium shadow-md"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Printable Content */}
          <div ref={contentRef} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 p-10 print:shadow-none">
            
            <div className="flex justify-between items-start mb-10 border-b pb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">PRESCRIPTION</h2>
                <p className="text-slate-500 mt-1">Hospital Management System</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Date: {format(new Date(prescription.prescriptionDate), 'dd MMMM yyyy')}</p>
                <p className="text-xs text-slate-500 mt-1">Prescription ID: #{prescription.id}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="font-bold text-slate-500 mb-3">PATIENT DETAILS</h3>
                <p className="text-2xl font-semibold">{prescription.patientName}</p>
                <p className="text-slate-600">ID: {prescription.patientId}</p>
                <p className="mt-2">{prescription.patientEmail}</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-500 mb-3">PRESCRIBED BY</h3>
                <p className="text-2xl font-semibold">Dr. {prescription.doctorName}</p>
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-12">
              <h3 className="font-black uppercase tracking-wider text-sm text-slate-500 mb-4">PRESCRIBED MEDICINES</h3>
              <div className="border border-slate-200 rounded-3xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-left">Medicine Name</th>
                      <th className="px-8 py-5 text-left">Dosage</th>
                      <th className="px-8 py-5 text-left">Quantity</th>
                      <th className="px-8 py-5 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prescription.items?.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-8 py-6 font-medium">{item.medicineName}</td>
                        <td className="px-8 py-6">{item.dosage || '—'}</td>
                        <td className="px-8 py-6">{item.quantity}</td>
                        <td className="px-8 py-6">
                          {item.priceAtIssue ? `$${item.priceAtIssue}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            {prescription.instructions && (
              <div className="mb-12">
                <h3 className="font-black uppercase tracking-wider text-sm text-slate-500 mb-4">DOCTOR'S INSTRUCTIONS</h3>
                <div className="bg-slate-50 p-8 rounded-3xl text-slate-700 leading-relaxed border border-slate-100">
                  {prescription.instructions}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 pt-8 border-t">
              This is a computer-generated prescription. Valid for 30 days from issuance date.
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </>
  );
}