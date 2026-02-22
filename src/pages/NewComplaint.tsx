import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Upload,
  X,
  Loader2,
  MoreVertical
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";
import { Department } from "../types";

export default function NewComplaint() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    const fetchDepts = async () => {
      const data = await api.departments.getAll();
      setDepartments(data);
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.complaints.create(formData);
      navigate("/complaints");
    } catch (err) {
      alert("Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-6 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Submit New Complaint</h2>
          <p className="text-slate-500 mt-1">Please provide as much detail as possible to help us resolve your issue.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Complaint Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              placeholder="e.g., Unable to access payroll system"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Category</label>
              <div className="relative">
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-medium"
                >
                  <option value="">Select a category</option>
                  {departments.map(dept => (
                    <optgroup key={dept.id} label={dept.name}>
                      {dept.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <MoreVertical className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Priority Level</label>
              <div className="relative">
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-medium"
                >
                  <option value="LOW">Low - General Inquiry</option>
                  <option value="MEDIUM">Medium - Standard Issue</option>
                  <option value="HIGH">High - Urgent Attention</option>
                  <option value="URGENT">Urgent - Critical Blocker</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <MoreVertical className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Detailed Description</label>
            <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium leading-relaxed"
              placeholder="Please describe the issue in detail, including steps to reproduce if applicable..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900 uppercase tracking-widest">Supporting Documents</label>
            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-all">
                <Upload className="w-8 h-8 group-hover:text-blue-600 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-all">Click or drag files to upload</p>
              <p className="text-xs mt-2 font-medium">Support for PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Discard Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-2xl shadow-slate-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Submit Case
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
