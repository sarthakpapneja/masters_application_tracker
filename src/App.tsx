import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, ListTodo, CheckCircle2, AlertCircle, Clock, GraduationCap, ChevronRight, Menu, X, Save, Trash2, Edit2 } from 'lucide-react';
import type { Application, ApplicationStatus, Stats } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'germany-masters-applications';

const DUMMY_DATA: Application[] = [
  {
    id: '1',
    university: 'TU Munich',
    course: 'M.Sc. Informatics',
    deadline: '2024-05-31',
    status: 'Interested',
    uniAssist: false,
    vpdRequired: false,
    documents: { sop: true, lor1: true, lor2: true, transcript: true, cv: true, languageCert: true },
    notes: 'Requires GRE. High competition.'
  },
  {
    id: '2',
    university: 'RWTH Aachen',
    course: 'M.Sc. Data Science',
    deadline: '2024-03-01',
    status: 'Applied',
    uniAssist: false,
    vpdRequired: true,
    documents: { sop: true, lor1: true, lor2: true, transcript: true, cv: true, languageCert: true },
    notes: 'VPD applied via Uni-Assist.'
  },
  {
    id: '3',
    university: 'TU Berlin',
    course: 'M.Sc. Computer Science',
    deadline: '2024-04-15',
    status: 'Interview',
    uniAssist: true,
    vpdRequired: false,
    documents: { sop: true, lor1: true, lor2: false, transcript: true, cv: true, languageCert: true },
    notes: 'Uni-Assist portal is open.'
  }
];

export default function App() {
  const [applications, setApplications] = useState<Application[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DUMMY_DATA;
      }
    }
    return DUMMY_DATA;
  });
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Application>>({
    university: '',
    course: '',
    deadline: '',
    status: 'Interested',
    uniAssist: false,
    vpdRequired: false,
    documents: {
      sop: false,
      lor1: false,
      lor2: false,
      transcript: false,
      cv: false,
      languageCert: false
    },
    notes: ''
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const stats: Stats = {
    total: applications.length,
    applied: applications.filter(a => ['Applied', 'Interview', 'Accepted', 'Rejected', 'Enrolled'].includes(a.status)).length,
    accepted: applications.filter(a => a.status === 'Accepted' || a.status === 'Enrolled').length,
    pending: applications.filter(a => a.status === 'Interested' || a.status === 'Applied' || a.status === 'Interview').length,
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepted':
      case 'Enrolled': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Interview': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.university || !formData.course) {
      alert('Please fill in both University and Course name.');
      return;
    }
    if (formData.id) {
      setApplications(apps => apps.map(a => a.id === formData.id ? (formData as Application) : a));
    } else {
      const newApp = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Application;
      setApplications(apps => [newApp, ...apps]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      university: '',
      course: '',
      deadline: '',
      status: 'Interested',
      uniAssist: false,
      vpdRequired: false,
      documents: {
        sop: false,
        lor1: false,
        lor2: false,
        transcript: false,
        cv: false,
        languageCert: false
      },
      notes: ''
    });
  };

  const deleteApplication = (id: string) => {
    setApplications(apps => apps.filter(a => a.id !== id));
    setConfirmDeleteId(null);
  };

  const openEdit = (app: Application) => {
    setFormData(app);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-uni-blue flex items-center gap-2">
          <GraduationCap className="text-german-red" />
          <span>DE Masters</span>
        </h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar / Navigation */}
      <nav className={cn(
        "fixed inset-0 z-40 bg-white transform transition-transform md:relative md:translate-x-0 md:w-64 md:border-r p-6 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center gap-2 mb-10">
          <GraduationCap className="text-german-red w-8 h-8" />
          <h1 className="text-2xl font-bold text-uni-blue text-nowrap">DE Masters</h1>
        </div>

        <div className="space-y-2 flex-1">
          <button
            onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              view === 'dashboard' ? "bg-uni-blue text-white shadow-lg shadow-blue-100" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => { setView('list'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              view === 'list' ? "bg-uni-blue text-white shadow-lg shadow-blue-100" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <ListTodo size={20} />
            Applications
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-german-red text-white w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-red-100 active:scale-95 transition-transform mt-6"
        >
          <Plus size={24} />
          New Application
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
        {view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Willkommen! 👋</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats.total} icon={<ListTodo className="text-blue-500" />} color="bg-blue-50" />
                <StatCard label="Applied" value={stats.applied} icon={<Clock className="text-amber-500" />} color="bg-amber-50" />
                <StatCard label="Accepted" value={stats.accepted} icon={<CheckCircle2 className="text-green-500" />} color="bg-green-50" />
                <StatCard label="Pending" value={stats.pending} icon={<AlertCircle className="text-red-500" />} color="bg-red-50" />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Recent Applications</h3>
                <button onClick={() => setView('list')} className="text-uni-blue font-semibold text-sm">View all</button>
              </div>
              <div className="space-y-4">
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-uni-blue transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl font-bold text-slate-400 group-hover:text-uni-blue group-hover:bg-blue-50 transition-colors">
                        {app.university[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{app.university}</h4>
                        <p className="text-sm text-slate-500">{app.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(app.status))}>
                        {app.status}
                      </span>
                      <ChevronRight className="text-slate-300" size={20} />
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <ListTodo className="text-slate-400" size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">No applications yet</h4>
                      <p className="text-slate-500 text-sm">Start tracking your journey to Germany!</p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-uni-blue font-bold px-6 py-2 rounded-full border border-uni-blue hover:bg-uni-blue hover:text-white transition-colors"
                    >
                      Add your first uni
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">Applications</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-uni-blue text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-xl text-slate-800">{app.university}</h3>
                      <p className="text-slate-500 font-medium">{app.course}</p>
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(app.status))}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} />
                      <span>DL: {app.deadline || 'No deadline'}</span>
                    </div>
                    {app.uniAssist && (
                      <div className="flex items-center gap-2 text-uni-blue font-bold italic">
                        <span>Uni-Assist</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex gap-2">
                      {Object.entries(app.documents).filter(([_, v]) => v).map(([k]) => (
                        <span key={k} className="w-2 h-2 rounded-full bg-green-500" title={k}></span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(app)} className="text-slate-400 hover:text-uni-blue font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Edit2 size={16} />
                        <span className="text-xs">Edit</span>
                      </button>
                      {confirmDeleteId === app.id ? (
                        <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="bg-german-red text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg shadow-lg shadow-red-100"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-slate-400 text-[10px] font-bold px-2 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(app.id)}
                          className="text-slate-400 hover:text-german-red font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-800">{formData.id ? 'Edit' : 'Add'} Application</h2>
                <p className="text-slate-500 font-medium italic">German University Tracker</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">University Name</label>
                    <input
                      required
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700"
                      placeholder="e.g. TU Munich"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Course Name</label>
                    <input
                      required
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700"
                      placeholder="e.g. Informatics"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Deadline</label>
                      <input
                        required
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700 appearance-none"
                      >
                        <option>Interested</option>
                        <option>Applied</option>
                        <option>Interview</option>
                        <option>Accepted</option>
                        <option>Rejected</option>
                        <option>Enrolled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className={cn(
                      "flex-1 flex items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest text-center",
                      formData.uniAssist ? "bg-blue-50 border-uni-blue text-uni-blue" : "bg-slate-50 border-transparent text-slate-400"
                    )}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.uniAssist}
                        onChange={(e) => setFormData({ ...formData, uniAssist: e.target.checked })}
                      />
                      Uni-Assist
                    </label>
                    <label className={cn(
                      "flex-1 flex items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest text-center",
                      formData.vpdRequired ? "bg-amber-50 border-amber-500 text-amber-600" : "bg-slate-50 border-transparent text-slate-400"
                    )}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.vpdRequired}
                        onChange={(e) => setFormData({ ...formData, vpdRequired: e.target.checked })}
                      />
                      VPD Needed
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Checklist (Documents Ready)</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.keys(formData.documents || {}).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        documents: { ...formData.documents!, [key]: !formData.documents![key as keyof typeof formData.documents] }
                      })}
                      className={cn(
                        "py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all",
                        formData.documents![key as keyof typeof formData.documents]
                          ? "bg-green-50 border-green-500 text-green-600 shadow-sm"
                          : "bg-slate-50 border-transparent text-slate-400"
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-uni-blue text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={24} />
                Save {formData.id ? 'Changes' : 'Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
