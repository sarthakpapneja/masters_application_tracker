import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, ListTodo, CheckCircle2, AlertCircle, Clock, GraduationCap, Menu, X, Save, Trash2, Edit2, FileCheck, Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Application, ApplicationStatus, Stats, User } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY_APPS = 'germany-masters-applications';
const STORAGE_KEY_USER = 'germany-masters-user';

const DUMMY_DATA: Application[] = [
  {
    id: '1',
    university: 'TU Munich',
    course: 'M.Sc. Informatics',
    deadline: '2024-05-31',
    status: 'Interested',
    uniAssist: false,
    vpdRequired: false,
    documents: { sop: true, lor1: true, lor2: true, transcript: true, cv: true, languageCert: true, gre: true, ielts: true, passport: true, photo: true },
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
    documents: { sop: true, lor1: true, lor2: true, transcript: true, cv: true, languageCert: true, gre: false, ielts: true, passport: true, photo: false },
    notes: 'VPD applied via Uni-Assist.'
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [applications, setApplications] = useState<Application[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_APPS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DUMMY_DATA;
      }
    }
    return DUMMY_DATA;
  });

  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : { isAuthenticated: false, name: '', email: '' };
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
      languageCert: false,
      gre: false,
      ielts: false,
      passport: false,
      photo: false
    },
    notes: ''
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingDocKey, setEditingDocKey] = useState<string | null>(null);
  const [editingDocValue, setEditingDocValue] = useState('');

  const [newRequirement, setNewRequirement] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const stats: Stats = {
    total: applications.length,
    applied: applications.filter((a: Application) => ['Applied', 'Interview', 'Accepted', 'Rejected', 'Enrolled'].includes(a.status)).length,
    accepted: applications.filter((a: Application) => a.status === 'Accepted' || a.status === 'Enrolled').length,
    pending: applications.filter((a: Application) => a.status === 'Interested' || a.status === 'Applied' || a.status === 'Interview').length,
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
      setApplications((apps: Application[]) => apps.map((a: Application) => a.id === formData.id ? (formData as Application) : a));
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
        languageCert: false,
        gre: false,
        ielts: false,
        passport: false,
        photo: false
      },
      notes: ''
    });
  };

  const deleteApplication = (id: string) => {
    setApplications((apps: Application[]) => apps.filter((a: Application) => a.id !== id));
    setConfirmDeleteId(null);
  };

  const handleRenameDoc = (oldKey: string) => {
    if (editingDocValue.trim() && editingDocValue.trim() !== oldKey) {
      const newDocs = { ...formData.documents };
      const value = !!newDocs[oldKey];
      delete newDocs[oldKey];
      newDocs[editingDocValue.trim()] = value;
      setFormData({ ...formData, documents: newDocs });
    }
    setEditingDocKey(null);
  };

  const openEdit = (app: Application) => {
    setFormData(app);
    setIsModalOpen(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Mock authentication delay
    setTimeout(() => {
      setUser({
        isAuthenticated: true,
        name: loginEmail.split('@')[0] || 'User',
        email: loginEmail
      });
      setIsLoggingIn(false);
    }, 1500);
  };

  const handleLogout = () => {
    setUser({ isAuthenticated: false, name: '', email: '' });
    setView('dashboard');
  };

  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-slate-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-400/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass p-10 rounded-[2.5rem] relative z-10 space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <GraduationCap size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">DE Masters</h1>
            <p className="text-slate-400 font-medium">Your gateway to German excellence</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-uni-blue/50 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-uni-blue/50 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-uni-blue hover:bg-slate-700 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-md relative overflow-hidden"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm font-medium">
            Don't have an account? <span className="text-uni-blue cursor-pointer hover:underline">Request access</span>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <h1 className="text-xl font-bold text-uni-blue dark:text-blue-400 flex items-center gap-2">
          <GraduationCap className="text-german-red" />
          <span>DE Masters</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar / Navigation */}
      <nav className={cn(
        "fixed inset-0 z-[60] bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-transform md:relative md:translate-x-0 md:w-72 p-6 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center justify-between gap-2 mb-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-german-red w-8 h-8" />
            <h1 className="text-2xl font-bold text-uni-blue dark:text-blue-400 text-nowrap">DE Masters</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="space-y-2 flex-1">
          <button
            onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              view === 'dashboard' ? "bg-uni-blue text-white shadow-lg shadow-blue-100" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => { setView('list'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              view === 'list' ? "bg-uni-blue text-white shadow-lg shadow-blue-100" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <ListTodo size={20} />
            Applications
          </button>
        </div>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-uni-blue rounded-xl flex items-center justify-center text-white">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-slate-900 dark:text-white truncate uppercase text-[10px] tracking-widest">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-german-red text-white w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-red-100 active:scale-95 transition-transform mt-6"
        >
          <Plus size={24} />
          New Application
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full transition-colors">
        {view === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Willkommen! 👋</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats.total} icon={<ListTodo className="text-blue-500" />} color="bg-blue-50" darkMode={darkMode} />
                <StatCard label="Applied" value={stats.applied} icon={<Clock className="text-amber-500" />} color="bg-amber-50" darkMode={darkMode} />
                <StatCard label="Accepted" value={stats.accepted} icon={<CheckCircle2 className="text-green-500" />} color="bg-green-50" darkMode={darkMode} />
                <StatCard label="Pending" value={stats.pending} icon={<AlertCircle className="text-red-500" />} color="bg-red-50" darkMode={darkMode} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic tracking-wide">Recent Applications</h3>
                <button
                  onClick={() => setView('list')}
                  className="text-uni-blue dark:text-blue-400 font-bold text-sm hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {applications.slice(0, 3).map(app => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => openEdit(app)}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-50/50 dark:hover:shadow-blue-900/10 hover:border-uni-blue/20 dark:hover:border-blue-500/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-slate-400 group-hover:text-uni-blue group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                          {app.university[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{app.university}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{app.course}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border", getStatusColor(app.status))}>
                          {app.status}
                        </span>
                        <div className="flex gap-1.5">
                          {app.uniAssist && <span className="bg-blue-50 dark:bg-blue-900/30 text-uni-blue dark:text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50 uppercase">Uni-Assist</span>}
                          {app.vpdRequired && <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50 uppercase">VPD</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
                      onClick={() => { resetForm(); setIsModalOpen(true); }}
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
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 italic tracking-tight">Applications</h2>
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-uni-blue dark:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 transition-transform"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>

            <div className="grid gap-6 pb-20">
              <AnimatePresence mode="popLayout">
                {applications.map(app => (
                  <motion.div
                    layout
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-blue-900/10 transition-all space-y-6 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-uni-blue dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                          {app.university[0]}
                        </div>
                        <div>
                          <h3 className="font-black text-2xl text-slate-800 dark:text-slate-100 tracking-tight">{app.university}</h3>
                          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide">{app.course}</p>
                        </div>
                      </div>
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusColor(app.status))}>
                        {app.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 py-4 border-y border-slate-50 dark:border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Deadline</span>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                          <Clock size={16} className="text-amber-500" />
                          <span className="text-sm">{app.deadline || 'No deadline'}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Process</span>
                        <div className="flex flex-wrap gap-2">
                          {app.uniAssist && <span className="bg-blue-50 dark:bg-blue-900/30 text-uni-blue dark:text-blue-400 text-[9px] font-black px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50 uppercase italic">Uni-Assist</span>}
                          {app.vpdRequired && <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-black px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50 uppercase italic">VPD</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Documents Readiness</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-green-600 dark:text-green-400">
                            {Object.values(app.documents).filter(Boolean).length} / {Object.keys(app.documents).length} Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <FileCheck size={16} className="text-slate-300 dark:text-slate-600 mr-1" />
                        <div className="flex -space-x-1">
                          {Object.entries(app.documents).filter(([_, v]) => v).slice(0, 5).map(([k]) => (
                            <div key={k} className="w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm" title={k}></div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(app)} className="text-slate-500 dark:text-slate-400 hover:text-uni-blue dark:hover:text-blue-400 font-black px-4 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-2 text-sm">
                          <Edit2 size={16} />
                          Edit
                        </button>
                        {confirmDeleteId === app.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="bg-german-red text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-red-100 dark:shadow-none"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(app.id)}
                            className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-german-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )
        }
      </main >

      {/* Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-10 space-y-8 animate-in slide-in-from-bottom-20 duration-500 my-auto transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{formData.id ? 'Edit' : 'Add'} Application</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic">German University Tracker</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                    setNewRequirement('');
                  }}
                  className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors text-slate-600 dark:text-slate-300"
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
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700 dark:text-slate-200"
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
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700 dark:text-slate-200"
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-german-red dark:text-red-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-4 py-3 focus:ring-0 focus:border-uni-blue transition-all font-bold text-slate-700 dark:text-slate-200 appearance-none"
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
                  <div className="flex items-center justify-between ml-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Document Checklist</label>
                    <span className="text-[10px] font-bold text-uni-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                      {Object.values(formData.documents || {}).filter(Boolean).length} / {Object.keys(formData.documents || {}).length} Ready
                    </span>
                  </div>

                  {/* Add dynamic requirement */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add custom doc requirement..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-uni-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newRequirement.trim()) {
                          setFormData({
                            ...formData,
                            documents: { ...(formData.documents || {}), [newRequirement.trim()]: false }
                          });
                          setNewRequirement('');
                        }
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-uni-blue dark:text-blue-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(formData.documents || {}).map((key) => (
                      <div key={key} className="relative group">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            documents: { ...formData.documents!, [key]: !formData.documents![key] }
                          })}
                          className={cn(
                            "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter border-2 transition-all flex flex-col items-center gap-2",
                            formData.documents![key]
                              ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400 shadow-lg shadow-green-100 dark:shadow-none"
                              : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-600"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center border",
                            formData.documents![key] ? "bg-green-500 border-green-400 text-white" : "border-slate-200 dark:border-slate-700"
                          )}>
                            {formData.documents![key] ? <CheckCircle2 size={12} strokeWidth={4} /> : null}
                          </div>

                          {editingDocKey === key ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingDocValue}
                              onChange={(e) => setEditingDocValue(e.target.value)}
                              onBlur={() => handleRenameDoc(key)}
                              onKeyDown={(e) => e.key === 'Enter' && handleRenameDoc(key)}
                              className="bg-white dark:bg-slate-700 border-none text-[9px] font-black uppercase text-center w-full focus:ring-0 p-1 rounded-lg"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDocKey(key);
                                setEditingDocValue(key);
                               }}
                              className="truncate w-full px-2 hover:underline cursor-text"
                              title="Click to rename"
                            >
                              {key}
                            </span>
                          )}
                        </button>

                        {/* Delete requirement button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newDocs = { ...formData.documents };
                            delete newDocs[key];
                            setFormData({ ...formData, documents: newDocs });
                          }}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-all shadow-sm z-20 active:scale-90"
                          title="Delete requirement"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-uni-blue dark:bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Save size={24} />
                  Save {formData.id ? 'Changes' : 'Application'}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}


function StatCard({ label, value, icon, color, darkMode }: { label: string, value: number, icon: React.ReactNode, color: string, darkMode: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", darkMode ? "bg-slate-800" : color)}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
