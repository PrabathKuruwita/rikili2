import React, { useState } from 'react';
import { BarChart3Icon, CalendarDaysIcon, DownloadIcon, FileTextIcon, HeartPulseIcon } from 'lucide-react';
import { Button, Card } from '../components/ui/primitives';
import { useApp } from '../context/AppContext';

type ReportTab = 'spending' | 'health' | 'generated';

const monthlySpend = [
  { month: 'Jan', value: 118, color: 'bg-indigo-500' }, { month: 'Feb', value: 84, color: 'bg-indigo-500' },
  { month: 'Mar', value: 480, color: 'bg-orange-500' }, { month: 'Apr', value: 120, color: 'bg-indigo-500' },
  { month: 'May', value: 840, color: 'bg-orange-500' }, { month: 'Jun', value: 62, color: 'bg-indigo-500' },
  { month: 'Jul', value: 0, color: 'bg-indigo-500' },
];

const reportFiles = [
  { name: 'Annual Tax Statement', date: 'Jul 01, 2026', type: 'PDF' },
  { name: 'Fuel Efficiency Report', date: 'Jun 28, 2026', type: 'CSV' },
  { name: 'Maintenance Forecast', date: 'Jun 15, 2026', type: 'PDF' },
];

function DonutChart() {
  return <div className="flex flex-col items-center justify-center gap-5 py-4"><div className="relative h-36 w-36 rounded-full" style={{ background: 'conic-gradient(#6366f1 0 24%, #f97316 24% 77%, #f59e0b 77% 94%, #10b981 94% 100%)' }}><div className="absolute inset-6 rounded-full bg-white" /></div><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />Routine Maintenance</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />Repairs</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Tires</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Inspections</span></div></div>;
}

function SpendingView() {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card className="p-4"><p className="text-xs text-slate-500">Total Spend (YTD)</p><p className="mt-1 text-2xl font-semibold">$1,397.62</p><div className="mt-2 h-1.5 rounded-full bg-indigo-100"><div className="h-full w-[65%] rounded-full bg-indigo-500" /></div><p className="mt-1 text-xs text-slate-400">65% of annual budget</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Service Visits</p><p className="mt-1 text-2xl font-semibold">12</p><p className="mt-2 text-xs text-emerald-600">+2 vs last year</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Avg. Cost / Mile</p><p className="mt-1 text-2xl font-semibold">$0.041</p><p className="mt-2 text-xs text-emerald-600">↓ 12% vs last year</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Fleet Health</p><p className="mt-1 text-2xl font-semibold">84%</p><p className="mt-2 text-xs text-slate-400">2 items pending</p></Card></div><div className="grid gap-5 lg:grid-cols-[1.7fr_0.85fr]"><Card className="p-5"><h2 className="text-sm font-semibold">Monthly Expenditure</h2><p className="mt-1 text-sm text-slate-500">Routine maintenance vs. repairs</p><div className="mt-6 grid grid-cols-[42px_1fr] gap-2"><div className="flex h-56 flex-col justify-between text-[11px] text-slate-400"><span>$1000</span><span>$750</span><span>$500</span><span>$250</span><span>$0</span></div><div className="relative flex h-56 items-end justify-around border-b border-dashed border-slate-200 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_55px,#e2e8f0_56px)] px-2">{monthlySpend.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className={`w-10 rounded-t ${item.color}`} style={{ height: `${Math.max(item.value / 1000 * 100, item.value ? 8 : 0)}%` }} /><span className="text-[11px] text-slate-400">{item.month}</span></div>)}</div></div></Card><Card className="p-5"><h2 className="text-sm font-semibold">Spend by Category</h2><DonutChart /></Card></div></div>;
}

function HealthView() {
  const health = [{ name: 'Tesla Model 3', score: 98, label: 'Healthy', color: 'text-emerald-600' }, { name: 'Toyota RAV4', score: 84, label: 'Needs attention', color: 'text-amber-500' }, { name: 'Ford F-150', score: 72, label: 'Service soon', color: 'text-red-500' }];
  return <div className="grid gap-5 lg:grid-cols-[1.7fr_0.85fr]"><Card className="p-5"><h2 className="text-sm font-semibold">Vehicle Health Overview</h2><p className="mt-1 text-sm text-slate-500">Overall health score based on service history and upcoming reminders</p><div className="mt-5 space-y-5">{health.map((item) => <div key={item.name}><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{item.name}</p><p className={`text-xs ${item.color}`}>{item.label}</p></div><span className="text-sm font-semibold">{item.score}%</span></div><div className="mt-1.5 h-2 rounded-full bg-indigo-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.score}%` }} /></div></div>)}</div></Card><Card className="p-5"><h2 className="text-sm font-semibold">Maintenance Forecast</h2><p className="mt-5 text-sm text-slate-500">Predicted next 90 days</p><p className="mt-1 text-2xl font-semibold">$412.50</p><dl className="mt-4 space-y-3 text-sm text-slate-500"><div className="flex justify-between"><dt>Oil changes</dt><dd className="font-medium text-slate-800">$170.00</dd></div><div className="flex justify-between"><dt>Tire rotation</dt><dd className="font-medium text-slate-800">$45.00</dd></div><div className="flex justify-between"><dt>Brake service</dt><dd className="font-medium text-slate-800">$280.00</dd></div><div className="flex justify-between"><dt>Inspections</dt><dd className="font-medium text-slate-800">$120.00</dd></div></dl></Card></div>;
}

function GeneratedView({ onDownload }: { onDownload: (name: string) => void }) {
  return <Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold">Recently Generated Reports</div><div className="divide-y divide-slate-100">{reportFiles.map((report) => <div key={report.name} className="flex items-center gap-3 px-5 py-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><FileTextIcon className="h-4 w-4" /></span><div className="flex-1"><p className="text-sm font-medium">{report.name}</p><p className="text-xs text-slate-400">Generated on {report.date}</p></div><span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">{report.type}</span><Button variant="ghost" size="sm" onClick={() => onDownload(report.name)}><DownloadIcon className="h-3.5 w-3.5" /> Download</Button></div>)}</div></Card>;
}

export function Reports() {
  const { toast } = useApp();
  const [tab, setTab] = useState<ReportTab>('spending');
  const tabs = [{ key: 'spending' as const, label: 'Spending', icon: BarChart3Icon }, { key: 'health' as const, label: 'Health', icon: HeartPulseIcon }, { key: 'generated' as const, label: 'Generated Reports', icon: FileTextIcon }];
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[25px] font-semibold tracking-tight">Fleet Reports</h1><p className="mt-1 text-sm text-slate-500">Financial summaries, maintenance trends, and vehicle health analytics.</p></div><div className="flex gap-2"><Button variant="secondary"><CalendarDaysIcon className="h-4 w-4" /> This Year</Button><Button onClick={() => toast('Report exported (demo)')}><DownloadIcon className="h-4 w-4" /> Export Report</Button></div></div><div className="inline-flex rounded-lg bg-slate-200/70 p-1">{tabs.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${tab === key ? 'bg-white font-medium text-slate-800 shadow-sm' : 'text-slate-500'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>{tab === 'spending' && <SpendingView />}{tab === 'health' && <HealthView />}{tab === 'generated' && <GeneratedView onDownload={(name) => toast(`${name} downloaded (demo)`)} />}</div>;
}
