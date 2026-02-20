import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Menu,
  Zap,
  CheckCircle,
  RefreshCcw,
  Filter,
  Search,
  X,
  ShieldCheck,
  Ban
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDept, setSelectedDept] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('risk') // 'risk' or 'safe'

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- SIMULATION STATE ---
  // Defaults set for Balanced results (~10-20% flagged)
  const [bradfordTrigger, setBradfordTrigger] = useState(400)
  const [marketRatio, setMarketRatio] = useState(0.8)
  const [burnoutHours, setBurnoutHours] = useState(60)
  const [noticeLimit, setNoticeLimit] = useState(60)

  const [simResults, setSimResults] = useState(null)
  const [simLoading, setSimLoading] = useState(false)

  // AUTO-RUN SIMULATION (Reactive)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only run if user can see the controls
      if (activeTab === 'simulation') {
        runSimulation()
      }
    }, 500) // 500ms Debounce
    return () => clearTimeout(timer)
  }, [bradfordTrigger, marketRatio, burnoutHours, noticeLimit, activeTab])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/employees')
      .then(res => {
        if (!res.ok) throw new Error("Failed to connect to Backend")
        return res.json()
      })
      .then(data => {
        setEmployees(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError("Error: Is your Python Server running? (Run 'run_backend.bat'!)")
        setLoading(false)
      })
  }, [])

  // --- FILTER LOGIC (Dept + Search + Risk/Safe) ---
  const requestMatches = (emp) => {
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  }

  const filteredEmployees = employees.filter(requestMatches)

  // Split Results into Risk vs Safe
  const riskList = simResults ? simResults.filter(r => r.risk_score > 0 && requestMatches(r)) : []
  const safeList = simResults ? simResults.filter(r => r.risk_score === 0 && requestMatches(r)) : []

  const displayList = viewMode === 'risk' ? riskList : safeList

  // --- RUN SIMULATION ---
  const runSimulation = async () => {
    setActiveTab('simulation')
    setSimLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bradford_trigger: parseInt(bradfordTrigger),
          market_compa_ratio: parseFloat(marketRatio),
          burnout_hours: parseFloat(burnoutHours),
          notice_period_limit: parseInt(noticeLimit)
        })
      })
      const data = await response.json()
      setSimResults(data)
      // Auto-switch to view risks if any exist, else safe
      const hasRisks = data.some(r => r.risk_score > 0)
      setViewMode(hasRisks ? 'risk' : 'safe')
    } catch (err) {
      alert("Simulation Failed! Check Console.")
      console.error(err)
    }
    setSimLoading(false)
  }

  const resetSimulation = () => {
    setSimResults(null)
    setActiveTab('dashboard')
  }

  // --- KPI CALCULATIONS ---
  const totalEmployees = filteredEmployees.length
  const avgSalary = filteredEmployees.reduce((sum, e) => sum + e.salary_lpa, 0) / (totalEmployees || 1)
  // Use sim results if available, else static heuristic
  // FIX: Use filtered results (Department Wise) for KPIs
  const highRiskCount = simResults
    ? riskList.length
    : filteredEmployees.filter(e => e.absence_spells > 5).length

  // DYNAMIC RETENTION SCORE
  const retentionScore = totalEmployees > 0
    ? Math.max(0, ((totalEmployees - highRiskCount) / totalEmployees * 100)).toFixed(0)
    : 100

  const deptData = filteredEmployees.reduce((acc, curr) => {
    const dept = curr.department
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const chartData = Object.keys(deptData).map(key => ({
    name: key,
    count: deptData[key],
  }))

  const departments = ['All', ...new Set(employees.map(e => e.department))]

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-xl font-semibold">Loading HR Data...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">{error}</div>

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex transition-all duration-300">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-400" />
            HR Sim <span className="text-xs bg-blue-600 px-1 rounded">PRO</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<Users />} label="Dashboard Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<AlertTriangle />} label="Risk Analysis" active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')} />
        </nav>
        <div className="p-4 border-t border-slate-800 text-slate-400 text-sm">
          Aditi Ahuja © 2026
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white shadow-sm w-full p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <Menu className="md:hidden text-gray-500 cursor-pointer" />

            {/* SEARCH BAR (Restored & Improved) */}
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {searchQuery && (
                <X onClick={() => setSearchQuery('')} className="w-4 h-4 absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-gray-600" />
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative group ml-4">
              <Filter className="w-4 h-4 absolute left-2 top-2.5 text-gray-400 pointer-events-none" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer font-medium text-gray-700">
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept} Dept</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400 font-semibold uppercase">Admin User</p>
              <p className="text-sm font-bold text-gray-700">Aditi Ahuja</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">AA</div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">

          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Headcount"
              value={totalEmployees}
              subtitle="5 Departments | Avg Tenure 2.3 yrs"
              icon={<Users className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              title="Avg Annual Salary"
              value={`₹${avgSalary.toFixed(1)}L`}
              subtitle="Range: ₹4.2L – ₹28.6L"
              icon={<DollarSign className="text-green-600" />}
              color="bg-green-50"
            />
            <StatCard
              title="Employees at Risk"
              value={highRiskCount}
              subtitle="↑ 3 since last simulation"
              icon={<AlertTriangle className="text-orange-500" />}
              color="bg-orange-50"
            />
            <StatCard
              title="Team Stability Score"
              value={`${retentionScore}%`}
              subtitle={`Based on ${highRiskCount} / ${totalEmployees} flagged`}
              icon={<TrendingUp className="text-purple-600" />}
              color="bg-purple-50"
            />
          </div>

          {/* === DASHBOARD VIEW === */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* CHART */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-700">
                  {selectedDept === 'All' ? 'Organization Structure' : `${selectedDept} Department Size`}
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SIMULATION CTA */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Risk Simulation Engine</h3>
                <p className="text-slate-300 mb-6 text-sm">Model policy changes for {selectedDept} employees.</p>
                <button onClick={() => setActiveTab('simulation')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all w-full shadow-lg shadow-blue-900/50">
                  Open Simulator
                </button>
              </div>
            </div>
          )}

          {/* === SIMULATION VIEW === */}
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

              {/* CONTROLS */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-24">
                <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Zap className="text-yellow-500 w-5 h-5 fill-current" />
                  Simulation Parameters
                </h3>
                <div className="space-y-6">
                  <SliderControl
                    label="Absenteeism Sensitivity"
                    value={bradfordTrigger} setter={setBradfordTrigger} min={100} max={1000} step={50}
                    helper="Low (100) = Very Strict. High (1000) = Ignore."
                  />
                  <SliderControl
                    label="Max Salary Gap Ratio"
                    value={marketRatio} setter={setMarketRatio} min={0.5} max={1.2} step={0.1}
                    helper="Low (0.5) = Ignore. High (1.2) = Strict."
                  />
                  <SliderControl
                    label="Max Allowed Overtime (Hrs)"
                    value={burnoutHours} setter={setBurnoutHours} min={40} max={80} step={5}
                    helper="Low (40) = Strict. High (80) = Ignore."
                  />
                  <SliderControl
                    label="Notice Period Threshold"
                    value={noticeLimit} setter={setNoticeLimit} min={30} max={90} step={15}
                    helper="Low (30) = Strict. High (90) = Ignore."
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={runSimulation}
                    disabled={simLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50">
                    {simLoading ? "Analyzing..." : "Run Simulation"}
                  </button>
                  {simResults && (
                    <button onClick={resetSimulation} className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg transition-colors">
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* RESULTS */}
              <div className="lg:col-span-2 space-y-6">
                {simResults && (
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setViewMode('risk')}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                                ${viewMode === 'risk' ? 'bg-red-100 text-red-700 ring-2 ring-red-400' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      <AlertTriangle className="w-5 h-5" />
                      High Risk ({riskList.length})
                    </button>
                    <button
                      onClick={() => setViewMode('safe')}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                                ${viewMode === 'safe' ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      <ShieldCheck className="w-5 h-5" />
                      Safe Employees ({safeList.length})
                    </button>
                  </div>
                )}

                {!simResults ? (
                  <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 flex flex-col items-center">
                    <Activity className="w-16 h-16 mb-4 text-gray-200" />
                    <p className="text-lg">Adjust parameters and click "Run Simulation" to see results.</p>
                  </div>
                ) : displayList.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center text-gray-600 flex flex-col items-center animate-fade-in-up">
                    {viewMode === 'risk' ? <CheckCircle className="w-16 h-16 mb-4 text-green-500" /> : <Ban className="w-16 h-16 mb-4 text-gray-400" />}
                    <h3 className="text-2xl font-bold mb-2">{viewMode === 'risk' ? "No Risks Found" : "No Safe Employees Found"}</h3>
                    <p>{viewMode === 'risk' ? "Try tightening parameters to be stricter." : "Try relaxing parameters to find safe employees."}</p>
                  </div>
                ) : (
                  <div className={`bg-white rounded-xl shadow-lg border overflow-hidden ring-4 animate-fade-in-up
                            ${viewMode === 'risk' ? 'border-red-100 ring-red-50' : 'border-green-100 ring-green-50'}`}>

                    <div className={`p-4 border-b flex justify-between items-center
                                ${viewMode === 'risk' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${viewMode === 'risk' ? 'text-red-800' : 'text-green-800'}`}>
                        {viewMode === 'risk' ? <AlertTriangle className="w-5 h-5 fill-red-100" /> : <ShieldCheck className="w-5 h-5 fill-green-100" />}
                        {viewMode === 'risk' ? 'Analysis Results' : 'Safe Employees'} ({displayList.length})
                      </h3>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className={`sticky top-0 z-10 shadow-sm ${viewMode === 'risk' ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
                          <tr>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider">Employee</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider">
                              Policy Risk Score
                              <span className="block text-[10px] font-normal lowercase tracking-normal text-gray-500 mt-1">Based on current slider settings</span>
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider">
                              ML Attrition Risk
                              <span className="block text-[10px] font-normal lowercase tracking-normal text-gray-500 mt-1">Based on employee data patterns</span>
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider">Est. Impact</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-sm ${viewMode === 'risk' ? 'divide-red-100' : 'divide-green-100'}`}>
                          {displayList.map((res, idx) => (
                            <tr key={idx} className={`transition-colors bg-white ${viewMode === 'risk' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}>
                              <td className="p-4 font-semibold text-gray-900">
                                {res.name}
                                <span className="text-xs text-gray-500 block font-normal">{res.department}</span>
                              </td>
                              <td className="p-4">
                                {viewMode === 'risk' ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${res.risk_score > 75 ? 'bg-red-600' : 'bg-orange-500'}`} style={{ width: `${res.risk_score}%` }}></div>
                                    </div>
                                    <span className={`font-bold ${res.risk_score > 75 ? 'text-red-600' : 'text-orange-600'}`}>{res.risk_score}</span>
                                  </div>
                                ) : (
                                  <span className="font-bold text-green-600">0 (Safe)</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded shadow-sm border
                                    ${res.ml_probability > 0.7
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : res.ml_probability > 0.4
                                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                                        : 'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full 
                                      ${res.ml_probability > 0.7
                                        ? 'bg-red-500'
                                        : res.ml_probability > 0.4
                                          ? 'bg-orange-500'
                                          : 'bg-green-500'
                                      }`}></span>
                                    {(res.ml_probability * 100).toFixed(0)}% Likely
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-medium text-gray-600">
                                {res.attrition_cost ? (
                                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                    ₹{(res.attrition_cost / 100000).toFixed(1)}L
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  {res.risk_factors.length > 0 ? (
                                    res.risk_factors.map((f, i) => (
                                      <span key={i} className="px-2 py-1 bg-white border border-red-200 text-red-700 text-xs rounded-md shadow-sm font-medium">{f}</span>
                                    ))
                                  ) : (
                                    <span className="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs rounded-md shadow-sm font-medium flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> No Concerns Detected
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

// --- SUB COMPONENTS ---

function SliderControl({ label, value, setter, min, max, step, helper }) {
  return (
    <div className="group">
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
        <span className="group-hover:text-blue-600 transition-colors">{label}</span>
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">{value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {helper && (
        <p className="text-[10px] text-gray-400 mt-1.5 italic group-hover:text-gray-600 transition-colors">
          💡 {helper}
        </p>
      )}
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group
        ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
    >
      <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className={`p-4 rounded-xl ${color} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[10px] text-gray-500 font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export default App
