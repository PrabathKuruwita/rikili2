import { useState } from 'react'
import {
  Calendar,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
  Plus,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react'

type TabType = 'spending' | 'health' | 'generated'
type DateRangeType = 'This Year' | 'Last 6 Months' | 'Last 12 Months' | 'All Time'

interface GeneratedReportItem {
  id: string
  title: string
  date: string
  type: 'PDF' | 'CSV'
  size?: string
}

const INITIAL_GENERATED_REPORTS: GeneratedReportItem[] = [
  {
    id: 'rep-1',
    title: 'Annual Tax Statement',
    date: 'Jul 01, 2026',
    type: 'PDF',
    size: '1.2 MB',
  },
  {
    id: 'rep-2',
    title: 'Fuel Efficiency Report',
    date: 'Jun 28, 2026',
    type: 'CSV',
    size: '340 KB',
  },
  {
    id: 'rep-3',
    title: 'Maintenance Forecast',
    date: 'Jun 15, 2026',
    type: 'PDF',
    size: '880 KB',
  },
]

export function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>('spending')
  const [dateRange, setDateRange] = useState<DateRangeType>('This Year')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null)

  // Generated reports list
  const [generatedReports, setGeneratedReports] = useState<GeneratedReportItem[]>(
    INITIAL_GENERATED_REPORTS
  )

  // New report form state
  const [newReportTitle, setNewReportTitle] = useState('')
  const [newReportType, setNewReportType] = useState<'PDF' | 'CSV'>('PDF')

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDownload = (title: string, type: string) => {
    triggerToast(`Downloading ${title}.${type.toLowerCase()}...`)
  }

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReportTitle.trim()) return

    const newRep: GeneratedReportItem = {
      id: `rep-${Date.now()}`,
      title: newReportTitle,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      type: newReportType,
      size: `${(Math.random() * 1.5 + 0.3).toFixed(1)} MB`,
    }

    setGeneratedReports([newRep, ...generatedReports])
    setNewReportTitle('')
    setIsNewReportModalOpen(false)
    triggerToast(`Generated new report: ${newRep.title}`)
  }

  // Monthly expenditure stacked bar data
  const barData = [
    { month: 'Jan', routine: 120, repairs: 0, total: 120 },
    { month: 'Feb', routine: 90, repairs: 0, total: 90 },
    { month: 'Mar', routine: 50, repairs: 435, total: 485 },
    { month: 'Apr', routine: 120, repairs: 0, total: 120 },
    { month: 'May', routine: 0, repairs: 842, total: 842 },
    { month: 'Jun', routine: 65, repairs: 0, total: 65 },
    { month: 'Jul', routine: 0, repairs: 0, total: 0 },
  ]

  // Category donut chart data
  const categoryData = [
    { name: 'Routine Maintenance', color: '#6366f1', percentage: 28, value: '$395.00' },
    { name: 'Repairs', color: '#f97316', percentage: 58, value: '$815.00' },
    { name: 'Tires', color: '#f59e0b', percentage: 10, value: '$140.00' },
    { name: 'Inspections', color: '#10b981', percentage: 4, value: '$47.62' },
  ]

  // Calculations for Donut chart paths
  let cumulativeAngle = 0
  const donutSlices = categoryData.map((cat, idx) => {
    const angle = (cat.percentage / 100) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    cumulativeAngle = endAngle

    // SVG arc calculation
    const r = 70
    const cx = 100
    const cy = 100
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return {
      ...cat,
      d,
      index: idx,
    }
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Fleet Reports
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Financial summaries, maintenance trends, and vehicle health analytics.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Date Range Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg z-40">
                {(
                  ['This Year', 'Last 6 Months', 'Last 12 Months', 'All Time'] as DateRangeType[]
                ).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setDateRange(range)
                      setIsDateMenuOpen(false)
                      triggerToast(`Filtered metrics for: ${range}`)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{range}</span>
                    {dateRange === range && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row (4 KPI Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend (YTD) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Spend (YTD)
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              $1,397.62
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: '65%' }}
              />
            </div>
            <p className="text-xs font-medium text-slate-400 mt-2">65% of annual budget</p>
          </div>
        </div>

        {/* Card 2: Service Visits */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Service Visits
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">12</div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+2 vs last year</span>
          </div>
        </div>

        {/* Card 3: Avg. Cost / Mile */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Cost / Mile
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              $0.041
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>↓ 12% vs last year</span>
          </div>
        </div>

        {/* Card 4: Fleet Health */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fleet Health
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2">84%</div>
          </div>
          <div className="mt-4 text-xs font-medium text-slate-400">2 items pending</div>
        </div>
      </div>

      {/* Sub-Tabs Pill Navigation Bar */}
      <div className="inline-flex rounded-xl bg-slate-200/50 p-1 border border-slate-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('spending')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'spending'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Spending
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'health'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Health
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('generated')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'generated'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Generated Reports
        </button>
      </div>

      {/* TAB CONTENT 1: SPENDING */}
      {activeTab === 'spending' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Expenditure Stacked Bar Chart (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monthly Expenditure</h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Routine maintenance vs. repairs
                  </p>
                </div>
                {/* Visual Legend indicator */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
                    <span>Routine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
                    <span>Repairs</span>
                  </div>
                </div>
              </div>

              {/* Stacked Bar Chart Graphic */}
              <div className="mt-8 relative">
                {/* Y-Axis Guidelines */}
                <div className="space-y-6 text-xs text-slate-400 font-medium">
                  {['$1000', '$750', '$500', '$250', '$0'].map((label, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-10 text-right shrink-0">{label}</span>
                      <div className="h-[1px] w-full bg-slate-100 border-b border-dashed border-slate-200" />
                    </div>
                  ))}
                </div>

                {/* Bars overlay */}
                <div className="absolute inset-y-0 left-14 right-4 flex items-end justify-between pt-4 pb-6">
                  {barData.map((item, index) => {
                    const maxScale = 1000
                    const totalH = (item.total / maxScale) * 100
                    const routineH = item.total > 0 ? (item.routine / item.total) * 100 : 0
                    const repairsH = item.total > 0 ? (item.repairs / item.total) * 100 : 0

                    const isHovered = hoveredBarIndex === index

                    return (
                      <div
                        key={item.month}
                        className="relative flex flex-col items-center group w-12 cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Hover Tooltip */}
                        {isHovered && item.total > 0 && (
                          <div className="absolute -top-16 z-30 flex flex-col items-center bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                            <span className="font-bold">{item.month} Total: ${item.total}</span>
                            {item.routine > 0 && <span>Routine: ${item.routine}</span>}
                            {item.repairs > 0 && <span>Repairs: ${item.repairs}</span>}
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-2 mt-0.5" />
                          </div>
                        )}

                        {/* Stacked bar container */}
                        <div
                          className="w-10 rounded-md overflow-hidden flex flex-col-reverse transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                          style={{ height: `${Math.max(totalH, 4)}%` }}
                        >
                          {/* Routine (Indigo) */}
                          <div
                            className="bg-indigo-600 w-full transition-all"
                            style={{ height: `${routineH}%` }}
                          />
                          {/* Repairs (Orange) */}
                          <div
                            className="bg-orange-500 w-full transition-all"
                            style={{ height: `${repairsH}%` }}
                          />
                        </div>

                        {/* X-Axis Month Label */}
                        <span
                          className={`text-xs font-semibold mt-3 transition-colors ${
                            isHovered ? 'text-indigo-600' : 'text-slate-500'
                          }`}
                        >
                          {item.month}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Spend by Category Donut Chart (1 col) */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Spend by Category</h3>

              {/* Donut Graphic */}
              <div className="relative flex items-center justify-center my-6 py-4">
                <svg className="w-52 h-52 transform -rotate-90 overflow-visible" viewBox="0 0 200 200">
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredDonutIndex === slice.index
                    return (
                      <path
                        key={slice.name}
                        d={slice.d}
                        fill={slice.color}
                        className="transition-all duration-200 cursor-pointer origin-center"
                        style={{
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                          filter: isHovered ? 'brightness(1.1)' : 'none',
                        }}
                        onMouseEnter={() => setHoveredDonutIndex(slice.index)}
                        onMouseLeave={() => setHoveredDonutIndex(null)}
                      />
                    )
                  })}
                  {/* Center hole for Donut */}
                  <circle cx="100" cy="100" r="48" fill="#ffffff" />
                </svg>

                {/* Donut Center Content */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  {hoveredDonutIndex !== null && categoryData[hoveredDonutIndex] ? (
                    <>
                      <span className="text-xs font-semibold text-slate-400">
                        {categoryData[hoveredDonutIndex].name}
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {categoryData[hoveredDonutIndex].value}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-xl font-bold text-slate-900">$1,397.62</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {categoryData.map((cat, idx) => (
                <div
                  key={cat.name}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                    hoveredDonutIndex === idx ? 'bg-slate-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredDonutIndex(idx)}
                  onMouseLeave={() => setHoveredDonutIndex(null)}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-700 truncate leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HEALTH */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Health Overview Card (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vehicle Health Overview</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Overall health score based on service history and upcoming reminders
              </p>

              {/* Vehicle Health List */}
              <div className="mt-8 space-y-6">
                {/* Vehicle 1: Tesla Model 3 */}
                <div className="space-y-2 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        Tesla Model 3
                      </span>
                      <span className="text-xs font-medium text-emerald-600">Healthy</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">98%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: '98%' }}
                    />
                  </div>
                </div>

                {/* Vehicle 2: Toyota RAV4 */}
                <div className="space-y-2 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-900">
                        Toyota RAV4
                      </span>
                      <span className="text-xs font-medium text-amber-600">Needs attention</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">84%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: '84%' }}
                    />
                  </div>
                </div>

                {/* Vehicle 3: Ford F-150 */}
                <div className="space-y-2 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-900">Ford F-150</span>
                      <span className="text-xs font-medium text-rose-600">Service soon</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">72%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Forecast Card (1 col) */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Maintenance Forecast</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Predicted next 90 days</p>

              <div className="mt-6">
                <span className="block text-2xl font-bold tracking-tight text-slate-900">
                  $412.50
                </span>

                {/* Forecast Breakdown List */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Oil changes</span>
                    <span className="text-xs font-bold text-slate-900">$170.00</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Tire rotation</span>
                    <span className="text-xs font-bold text-slate-900">$45.00</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Brake service</span>
                    <span className="text-xs font-bold text-slate-900">$280.00</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-medium text-slate-500">Inspections</span>
                    <span className="text-xs font-bold text-slate-900">$120.00</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => triggerToast('Maintenance forecast updated based on current usage.')}
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              Update Prediction Parameters
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: GENERATED REPORTS */}
      {activeTab === 'generated' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recently Generated Reports</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                View or download previous financial and health statements
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewReportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate New Report</span>
            </button>
          </div>

          {/* Generated Reports List */}
          <div className="divide-y divide-slate-100 mt-2">
            {generatedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between py-4 px-2 hover:bg-slate-50/80 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Generated on {report.date} {report.size ? `• ${report.size}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* File Type Pill */}
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {report.type}
                  </span>

                  {/* Download Action Button */}
                  <button
                    type="button"
                    onClick={() => handleDownload(report.title, report.type)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-indigo-200 hover:text-indigo-600 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Export Fleet Report</h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Type
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600">
                  <option>Full Fleet Performance & Financial Summary</option>
                  <option>Monthly Expenditure Breakdown</option>
                  <option>Vehicle Health & Maintenance Forecast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 p-3 text-xs font-bold text-indigo-700"
                  >
                    <FileText className="h-4 w-4" />
                    <span>PDF Document</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>CSV / Excel</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false)
                  triggerToast('Exporting Fleet Report to PDF...')
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Report Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Generate Custom Report</h3>
              <button
                type="button"
                onClick={() => setIsNewReportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Maintenance Log"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format Type
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      checked={newReportType === 'PDF'}
                      onChange={() => setNewReportType('PDF')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    PDF Statement
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      checked={newReportType === 'CSV'}
                      onChange={() => setNewReportType('CSV')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    CSV Data Export
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
