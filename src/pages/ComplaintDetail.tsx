import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  MessageSquare, 
  Send,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Paperclip,
  UserPlus
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";
import { Complaint, Role, User } from "../types";
import { STATUS_COLORS, PRIORITY_COLORS } from "../constants";
import { format } from "date-fns";

export default function ComplaintDetail({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await api.complaints.getById(id);
        setComplaint(data);
        if (user.role === "ADMIN") {
          const staff = await api.admin.getStaff();
          setStaffList(staff);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user.role]);

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
    try {
      const updated = await api.complaints.update(id, { status });
      setComplaint(prev => prev ? { ...prev, status: updated.status } : null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssign = async (staffId: string) => {
    if (!id) return;
    try {
      await api.admin.assign(id, staffId);
      const updated = await api.complaints.getById(id);
      setComplaint(updated);
      setIsAssigning(false);
    } catch (err) {
      alert("Failed to assign");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!complaint) return <div>Complaint not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Case #{complaint.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-400 font-medium">Created {format(new Date(complaint.createdAt), "MMM d, yyyy")}</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{complaint.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <div className="relative">
              <button 
                onClick={() => setIsAssigning(!isAssigning)}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-slate-400" />
                {complaint.assignedTo ? complaint.assignedTo.name : "Assign Staff"}
              </button>
              {isAssigning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 p-2 overflow-hidden"
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Available Staff</div>
                  {staffList.map(staff => (
                    <button
                      key={staff.id}
                      onClick={() => handleAssign(staff.id)}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">{staff.name.charAt(0)}</div>
                      {staff.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {(user.role === "STAFF" || user.role === "ADMIN") && (
            <div className="relative">
              <select
                value={complaint.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className={`pl-6 pr-12 py-3 rounded-2xl text-sm font-bold border appearance-none cursor-pointer shadow-sm transition-all ${STATUS_COLORS[complaint.status]}`}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <MoreVertical className="w-4 h-4 rotate-90" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Description</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{complaint.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-12 pt-10 border-t border-slate-50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                <p className="text-sm font-bold text-slate-900">{complaint.category.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                <div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-xl border ${PRIORITY_COLORS[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporter</p>
                <p className="text-sm font-bold text-slate-900">{complaint.user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Update</p>
                <p className="text-sm font-bold text-slate-900">{format(new Date(complaint.updatedAt), "MMM d, HH:mm")}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                Discussion
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                {complaint.comments?.length || 0} Messages
              </span>
            </div>
            
            <div className="space-y-6">
              {complaint.comments?.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-400 font-medium">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                complaint.comments?.map((c) => (
                  <motion.div 
                    key={c.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold">
                      {c.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-premium">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-900">{c.user.name}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{format(new Date(c.createdAt), "MMM d, HH:mm")}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{c.message}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-premium flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Paperclip className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Type your message here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <button className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Case Timeline</h3>
            <div className="space-y-10 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-md"></div>
                <p className="text-xs font-bold text-slate-900">Complaint Created</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(new Date(complaint.createdAt), "MMM d, HH:mm")}</p>
              </div>
              {complaint.status !== "OPEN" && (
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-md"></div>
                  <p className="text-xs font-bold text-slate-900">Status: {complaint.status.replace("_", " ")}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(new Date(complaint.updatedAt), "MMM d, HH:mm")}</p>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white shadow-md"></div>
                  <p className="text-xs font-bold text-slate-900">Case Resolved</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(new Date(complaint.resolvedAt), "MMM d, HH:mm")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Attachments</h3>
              <Paperclip className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                  <Paperclip className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No files attached</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
