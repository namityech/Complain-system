import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  Plus,
  Calendar,
  User as UserIcon,
  FileText
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";
import { Complaint, Role } from "../types";
import { STATUS_COLORS, PRIORITY_COLORS } from "../constants";
import { format } from "date-fns";

export default function ComplaintList({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const data = await api.complaints.getAll({ search, status: statusFilter });
        setComplaints(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, [search, statusFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Filters Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium">
        <div className="relative w-full lg:w-1/3 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            {["", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status === "" ? "All" : status.replace("_", " ")}
              </button>
            ))}
          </div>
          
          {role === "USER" && (
            <Link
              to="/complaints/new"
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all text-sm font-bold shadow-xl shadow-slate-200"
            >
              <Plus className="w-5 h-5" />
              New Complaint
            </Link>
          )}
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaint Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-slate-400">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">No complaints found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <motion.tr 
                    key={complaint.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{complaint.title}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {complaint.user.name.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {complaint.user.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        {complaint.category.name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${PRIORITY_COLORS[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${STATUS_COLORS[complaint.status]}`}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{format(new Date(complaint.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-[10px] font-medium text-slate-400 mt-0.5">{format(new Date(complaint.createdAt), "HH:mm a")}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all group-hover:shadow-lg group-hover:shadow-blue-200">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{complaints.length}</span> entries
          </p>
          <div className="flex gap-3">
            <button disabled className="px-5 py-2 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-xl opacity-50 cursor-not-allowed">Previous</button>
            <button disabled className="px-5 py-2 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-xl opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
