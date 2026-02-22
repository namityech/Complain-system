import { useEffect, useState } from "react";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion } from "motion/react";
import { api } from "../services/api";
import { User } from "../types";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.admin.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const stats = [
    { label: "Total Complaints", value: analytics.counts.total, icon: Users, color: "blue", trend: "+12%" },
    { label: "Open Issues", value: analytics.counts.open, icon: AlertCircle, color: "orange", trend: "-5%" },
    { label: "Resolved", value: analytics.counts.resolved, icon: CheckCircle2, color: "green", trend: "+24%" },
    { label: "Resolution Rate", value: `${Math.round((analytics.counts.resolved / analytics.counts.total) * 100 || 0)}%`, icon: TrendingUp, color: "indigo", trend: "+8%" },
  ];

  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#6366f1", "#8b5cf6"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Analytics Overview</h2>
          <p className="text-slate-500 mt-1">Real-time performance metrics across all departments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              +12
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 ml-2">Active Staff</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium group hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${stat.trend.startsWith("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {stat.trend}
                {stat.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Department Distribution</h3>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-full px-4 py-2 outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deptStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: "#f8fafc", radius: 12 }}
                  contentStyle={{ 
                    borderRadius: "20px", 
                    border: "none", 
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px"
                  }}
                />
                <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={32}>
                  {analytics.deptStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Live Feed</h3>
          <div className="space-y-8 flex-1">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-start gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                  <Clock className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-all" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-all">Complaint #{Math.floor(Math.random() * 9000) + 1000}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Status changed to In Progress by Staff</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 text-sm font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100">
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
