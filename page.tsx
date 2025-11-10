// apps/web/app/dashboard/page.tsx
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { ChartSection } from '@/components/dashboard/chart-section';
import { ChatInterface } from '@/components/chat-interface';
import { CreditCard, Receipt, Upload, DollarSign, Home } from 'lucide-react';

async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const overviewRes = await fetch(`${baseUrl}/api/overview`);
  const chartRes = await fetch(`${baseUrl}/api/charts`);
  
  const overviewData = await overviewRes.json();
  const chartData = await chartRes.json();
  
  return { overviewData, chartData };
}

export default async function DashboardPage() {
  const { overviewData, chartData } = await getDashboardData();
  
  const cardData = [
    { title: 'Total Spend (YTD)', value: `$${parseFloat(overviewData.totalSpendYTD).toLocaleString()}`, icon: DollarSign, change: '10.5%' },
    { title: 'Total Invoices Processed', value: overviewData.totalInvoicesProcessed.toLocaleString(), icon: Receipt, change: '5.2%' },
    { title: 'Documents Uploaded', value: overviewData.documentsUploaded.toLocaleString(), icon: Upload, change: '3.1%' },
    { title: 'Average Invoice Value', value: `$${parseFloat(overviewData.averageInvoiceValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: CreditCard, change: '1.8%' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Pixel-perfect styling goes here) */}
      <aside className="w-64 bg-[#0a0f21] p-4 text-white shadow-lg">
        <h1 className="text-xl font-bold mb-10 text-indigo-400">Flowbit AI</h1>
        <div className="space-y-2">
          <div className="flex items-center p-3 rounded-lg bg-indigo-600 font-semibold">
            <Home className="w-5 h-5 mr-3" /> Dashboard
          </div>
          {/* ...other navigation links */}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Interactive Analytics Dashboard</h1>
        
        {/* 1. Overview Cards (Task 1) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {cardData.map((data, index) => (
            <DashboardCard key={index} {...data} />
          ))}
        </div>

        {/* 2. Charts and Chat Interface */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          
          {/* Charts Section - Takes 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <ChartSection chartData={chartData} />
          </div>

          {/* Chat with Data Interface - Takes 1/3 width */}
          <div className="lg:col-span-1 h-full">
            <ChatInterface />
          </div>
        </div>

        {/* 3. Invoices Table (Task 1) */}
        <InvoicesTable />
      </main>
    </div>
  );
}