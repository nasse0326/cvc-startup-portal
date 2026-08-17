import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Calendar, 
  Settings, 
  Sun, 
  Moon,
  Sparkles,
  CheckCircle,
  XCircle,
  X,
  Plus,
  Users,
  LogOut,
  ChevronDown,
  Building,
  User,
  Copy,
  Info,
  FileSpreadsheet,
  Upload,
  Download
} from 'lucide-react';

import { downloadImportTemplate, parseStartupsCSV } from './services/importCsv';

import Dashboard from './components/Dashboard';
import StartupList from './components/StartupList';
import MeetingTimeline from './components/MeetingTimeline';
import StartupDetailModal from './components/StartupDetailModal';
import Login from './components/Login';
import { Analytics } from '@vercel/analytics/react';

import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  isFirebaseConfigured,
  getFirebaseConfig,
  saveFirebaseConfig,
  logoutUser,
  logoutMockUser,
  createTeam,
  joinTeamWithCode,
  subscribeToUserTeams,
  onAuthChanged
} from './services/firebase';

import { 
  getGeminiApiKey, 
  saveGeminiApiKey 
} from './services/gemini';

import { 
  initialStartups, 
  initialMeetings 
} from './services/seedData';

import './App.css';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation & Theme
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('cvc_theme') === 'dark' || 
      (!('cvc_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Workspace & Team States
  const [myTeams, setMyTeams] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // New Team / Join Team Forms
  const [newTeamName, setNewTeamName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [teamFormLoading, setTeamFormLoading] = useState(false);

  // Global Pipeline State (filtered by workspace)
  const [startups, setStartups] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);

  // User Name (for audit trail updatedBy)
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('cvc_user_name') || '';
  });

  // Settings Drawer Toggle
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [configReloadTrigger, setConfigReloadTrigger] = useState(0);

  // Settings Form Inputs
  const [geminiKey, setGeminiKey] = useState('');
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbStorageBucket, setFbStorageBucket] = useState('');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('');
  const [fbAppId, setFbAppId] = useState('');

  // CSV Import States
  const [csvImportFile, setCsvImportFile] = useState(null);
  const [csvParsedData, setCsvParsedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Toast Notification System
  const [toast, setToast] = useState(null);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Sync theme class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cvc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cvc_theme', 'light');
    }
  }, [darkMode]);

  // 2. Auth state change observer
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = onAuthChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [configReloadTrigger]);

  // 3. Load API configurations when settings open
  useEffect(() => {
    setGeminiKey(getGeminiApiKey());
    const fb = getFirebaseConfig() || {};
    setFbApiKey(fb.apiKey || '');
    setFbAuthDomain(fb.authDomain || '');
    setFbProjectId(fb.projectId || '');
    setFbStorageBucket(fb.storageBucket || '');
    setFbMessagingSenderId(fb.messagingSenderId || '');
    setFbAppId(fb.appId || '');
  }, [isSettingsOpen, configReloadTrigger]);

  // 4. Fetch User's Workspaces / Teams in real-time
  useEffect(() => {
    if (!currentUser) {
      setMyTeams([]);
      return;
    }
    const unsubscribe = subscribeToUserTeams(currentUser.uid, (teams) => {
      setMyTeams(teams);
    });
    return unsubscribe;
  }, [currentUser, configReloadTrigger]);

  // 5. Select default workspace (personal workspace id based on user uid)
  useEffect(() => {
    if (!currentUser) return;
    const personalId = `personal_${currentUser.uid}`;
    
    const savedWorkspace = localStorage.getItem('cvc_active_workspace');
    // Verify saved workspace is valid (either personal or user belongs to that team)
    const isValid = savedWorkspace === personalId || myTeams.some(t => t.id === savedWorkspace);
    
    if (isValid) {
      setActiveWorkspaceId(savedWorkspace);
    } else {
      setActiveWorkspaceId(personalId);
      localStorage.setItem('cvc_active_workspace', personalId);
    }
  }, [currentUser, myTeams]);

  // 6. Real-time Subscription to Startups and Meetings (filtered by workspaceId)
  useEffect(() => {
    if (!currentUser || !activeWorkspaceId) return;

    let unsubStartups = () => {};
    let unsubMeetings = () => {};

    try {
      unsubStartups = subscribeToCollection('startups', activeWorkspaceId, (data) => {
        setStartups(data);
      }, initialStartups);

      unsubMeetings = subscribeToCollection('meetings', activeWorkspaceId, (data) => {
        setMeetings(data);
      }, initialMeetings);
    } catch (err) {
      console.error("Subscription setup failed:", err);
      showToast("Subscription setup error. Running in local fallback.", "error");
    }

    return () => {
      unsubStartups();
      unsubMeetings();
    };
  }, [activeWorkspaceId, currentUser, configReloadTrigger]);

  // Process startups to ensure immutable fixed sequence number 'no' and 'createdAtDate'
  const processedStartups = useMemo(() => {
    if (!startups || startups.length === 0) return [];
    
    // Sort copy by createdAt if available to assign consistent numbers for legacy data
    const sortedByCreated = [...startups].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    // Map fixed index 'no' if not present
    const idToNoMap = new Map();
    sortedByCreated.forEach((s, idx) => {
      idToNoMap.set(s.id, s.no || (idx + 1));
    });

    return startups.map(s => {
      const fixedNo = idToNoMap.get(s.id) || s.no || 1;
      const dateStr = s.createdAtDate || (s.createdAt && typeof s.createdAt === 'string' ? s.createdAt.split('T')[0].replace(/-/g, '/') : '2026/08/01');
      return {
        ...s,
        no: fixedNo,
        createdAtDate: dateStr
      };
    });
  }, [startups]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      setSelectedStartup(null);
      if (currentUser?.isMock) {
        logoutMockUser();
        setCurrentUser(null);
      } else {
        await logoutUser();
      }
      showToast("Logged out successfully.", "info");
    } catch (err) {
      console.error(err);
      showToast("Sign out failed.", "error");
    }
  };

  // Save Settings Form
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // Save User Name
    if (userName) {
      localStorage.setItem('cvc_user_name', userName.trim());
    } else {
      localStorage.removeItem('cvc_user_name');
    }

    // Save Gemini API Key
    saveGeminiApiKey(geminiKey);

    // Save Firebase Credentials if any are provided
    if (fbApiKey && fbProjectId) {
      const config = {
        apiKey: fbApiKey,
        authDomain: fbAuthDomain,
        projectId: fbProjectId,
        storageBucket: fbStorageBucket,
        messagingSenderId: fbMessagingSenderId,
        appId: fbAppId
      };
      saveFirebaseConfig(config);
      showToast("Firebase Config saved. Re-connecting...", "success");
    } else {
      saveFirebaseConfig(null);
      showToast("Cleared Cloud config. Sandbox Active.", "info");
    }

    // Refresh Subscriptions and Auth
    setConfigReloadTrigger(prev => prev + 1);
    setIsSettingsOpen(false);
  };

  // Create Team Workspace
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !currentUser) return;
    setTeamFormLoading(true);

    try {
      const team = await createTeam(newTeamName.trim(), currentUser.uid);
      setNewTeamName('');
      setActiveWorkspaceId(team.id);
      localStorage.setItem('cvc_active_workspace', team.id);
      setIsTeamModalOpen(false);
      showToast(`Team "${team.name}" created!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to create team.", "error");
    } finally {
      setTeamFormLoading(false);
    }
  };

  // Join Team via invite code
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinInviteCode.trim() || !currentUser) return;
    setTeamFormLoading(true);

    try {
      const team = await joinTeamWithCode(joinInviteCode.trim(), currentUser.uid);
      setJoinInviteCode('');
      setActiveWorkspaceId(team.id);
      localStorage.setItem('cvc_active_workspace', team.id);
      setIsTeamModalOpen(false);
      showToast(`Joined team "${team.name}"!`, "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to join team.", "error");
    } finally {
      setTeamFormLoading(false);
    }
  };

  // Copy team invite code helper
  const handleCopyInvite = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Invite code ${code} copied to clipboard!`, "success");
  };

  // Pipeline Mutators (Enriches data with workspaceId and ownerId)
  const handleAddStartup = async (startupData) => {
    try {
      const nowStr = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentAuthor = userName || (currentUser?.displayName || currentUser?.email?.split('@')[0] || '担当者');

      const enriched = {
        ...startupData,
        workspaceId: activeWorkspaceId,
        ownerId: currentUser.uid,
        updatedBy: currentAuthor,
        updatedAt: nowStr,
        createdAt: new Date().toISOString()
      };
      await addDocument('startups', enriched);
      showToast(`${startupData.name} profile initialized!`, "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save startup.", "error");
    }
  };

  // CSV File Upload & Parsing Handler
  const handleCSVFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseStartupsCSV(text);
        setCsvParsedData(parsed);
        if (parsed.length === 0) {
          showToast("CSVから有効なスタートアップデータを検出できませんでした。", "warning");
        } else {
          showToast(`${parsed.length}件のスタートアップデータを検出しました。`, "info");
        }
      } catch (err) {
        console.error(err);
        showToast("CSVの読み込みに失敗しました。", "error");
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Batch Import Execution
  const handleExecuteBatchImport = async () => {
    if (!csvParsedData || csvParsedData.length === 0) return;
    setIsImporting(true);

    try {
      let count = 0;
      for (const item of csvParsedData) {
        await handleAddStartup(item);
        count++;
      }
      showToast(`${count}件のスタートアップを一括登録しました！`, "success");
      setCsvImportFile(null);
      setCsvParsedData([]);
    } catch (err) {
      console.error(err);
      showToast("一部のスタートアップの登録に失敗しました。", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdateStartup = async (id, updatedData) => {
    try {
      const nowStr = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentAuthor = userName || (currentUser?.displayName || currentUser?.email?.split('@')[0] || '担当者');

      const enriched = {
        ...updatedData,
        updatedBy: currentAuthor,
        updatedAt: nowStr
      };

      await updateDocument('startups', id, enriched);
      if (selectedStartup && selectedStartup.id === id) {
        setSelectedStartup(enriched);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile.", "error");
    }
  };

  const handleDeleteStartup = async (id) => {
    try {
      await deleteDocument('startups', id);
      const linked = meetings.filter(m => m.startupId === id);
      for (const m of linked) {
        await deleteDocument('meetings', m.id);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to delete startup profile.", "error");
    }
  };

  const handleBulkDeleteStartups = async (ids) => {
    if (!ids || ids.length === 0) return;
    try {
      let count = 0;
      for (const id of ids) {
        await deleteDocument('startups', id);
        const linked = meetings.filter(m => m.startupId === id);
        for (const m of linked) {
          await deleteDocument('meetings', m.id);
        }
        count++;
      }
      showToast(`${count}件の企業データを一括削除しました。`, "success");
    } catch (error) {
      console.error(error);
      showToast("一括削除処理中にエラーが発生しました。", "error");
    }
  };

  const handleAddMeeting = async (meetingData) => {
    try {
      const nowStr = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentAuthor = userName || (currentUser?.displayName || currentUser?.email?.split('@')[0] || '担当者');

      const enriched = {
        ...meetingData,
        workspaceId: activeWorkspaceId,
        ownerId: currentUser.uid,
        updatedBy: currentAuthor,
        updatedAt: nowStr,
        createdAt: new Date().toISOString()
      };
      await addDocument('meetings', enriched);
    } catch (error) {
      console.error(error);
      showToast("Failed to save meeting log.", "error");
    }
  };

  const handleUpdateMeeting = async (id, updatedData) => {
    try {
      const nowStr = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentAuthor = userName || (currentUser?.displayName || currentUser?.email?.split('@')[0] || '担当者');

      const enriched = {
        ...updatedData,
        updatedBy: currentAuthor,
        updatedAt: nowStr
      };

      await updateDocument('meetings', id, enriched);
    } catch (error) {
      console.error(error);
      showToast("Failed to update meeting log.", "error");
    }
  };

  const hasFirebase = isFirebaseConfigured();
  const hasGemini = !!geminiKey;

  // Render Full Screen Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse-slow mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-450 font-medium">Authenticating credentials...</p>
      </div>
    );
  }

  // Render Login Page if not signed in
  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} showToast={showToast} />;
  }

  // Find active workspace details
  const activeWorkspace = activeWorkspaceId?.startsWith('personal_') 
    ? { name: "Personal Workspace", isPersonal: true }
    : myTeams.find(t => t.id === activeWorkspaceId) || { name: "Loading workspace...", id: activeWorkspaceId };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 pb-16">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-850 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-650 p-2 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Sparkles className="h-5 w-5 animate-pulse-slow" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Antigravity CVC</span>
              <span className="text-[10px] block font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Synergy Portal</span>
            </div>
          </div>

          {/* Workspace Switcher Component */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 ml-2 sm:ml-4 max-w-[170px] xs:max-w-[200px] sm:max-w-xs shrink-0">
            <Building className="h-4 w-4 text-slate-400 ml-1 sm:ml-1.5 shrink-0" />
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                setActiveWorkspaceId(e.target.value);
                localStorage.setItem('cvc_active_workspace', e.target.value);
              }}
              className="flex-1 min-w-0 bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-350 pr-4 sm:pr-6 pl-1 py-1 focus:outline-none cursor-pointer truncate"
            >
              <option value={`personal_${currentUser.uid}`}>Personal Workspace</option>
              {myTeams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsTeamModalOpen(true)}
              className="relative z-10 px-2 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 font-bold text-xs shrink-0 transition-all shadow-sm active:scale-95 flex items-center justify-center min-h-[36px] sm:min-h-[30px]"
              title="Manage Teams"
            >
              + Team
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 mx-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'directory', label: 'Startups', icon: Database },
              { id: 'meetings', label: 'Meetings', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all min-h-[38px] ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/40 dark:border-slate-800' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Utility Tools & User Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Settings Toggler (Min 44x44px target) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all flex items-center justify-center min-h-[44px] min-w-[44px] relative"
            >
              <Settings className="h-5 w-5" />
              {(!hasFirebase || !hasGemini) && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* User Dropdown Profile (Min 44x44px target) */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 p-1 rounded-xl border border-slate-200/65 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[44px]"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {currentUser.email?.charAt(0) || "U"}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-xl animate-scale-up z-50">
                  <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 block uppercase">Logged in as</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{currentUser.email}</span>
                    {currentUser.isMock && (
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Guest Sandbox Account
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsTeamModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg min-h-[40px]"
                  >
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Manage Workspace Teams</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg min-h-[40px] border-t border-slate-100 dark:border-slate-800/50 mt-1.5 pt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Render Tab Contents */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            startups={processedStartups} 
            meetings={meetings} 
            onSelectStartup={setSelectedStartup}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'directory' && (
          <StartupList 
            startups={processedStartups} 
            onSelectStartup={setSelectedStartup}
            onAddStartup={handleAddStartup}
            onBulkDeleteStartups={handleBulkDeleteStartups}
            showToast={showToast}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingTimeline 
            meetings={meetings} 
            startups={processedStartups} 
            onAddMeeting={handleAddMeeting}
            onUpdateMeeting={handleUpdateMeeting}
            showToast={showToast}
          />
        )}

      </main>

      {/* Profile Detail Drawer Modal */}
      {selectedStartup && (
        <StartupDetailModal 
          startup={selectedStartup}
          meetings={meetings}
          onClose={() => setSelectedStartup(null)}
          onUpdateStartup={handleUpdateStartup}
          onDeleteStartup={handleDeleteStartup}
          showToast={showToast}
        />
      )}

      {/* API Settings Drawer Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-850 flex flex-col animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">API & Cloud Integrations</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSaveSettings} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* User Name Config */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider">
                  担当者名 / お名前 (更新スタンプ用)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 pb-1">
                  データ更新時に「最終更新者」として自動記録されるお名前です。
                </p>
                <input 
                  type="text" 
                  placeholder="例：山田 太郎"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm font-medium"
                />
              </div>
              
              {/* Integration Status Badges */}
              <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Connection Status</h3>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Gemini Synergy Engine:</span>
                  {hasGemini ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="h-4 w-4 mr-1" /> Active (Local API Key)
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-500 font-bold">
                      <XCircle className="h-4 w-4 mr-1" /> Needs Setup
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Cloud Storage:</span>
                  {hasFirebase ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="h-4 w-4 mr-1" /> Firestore Shared Sync
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-400 dark:text-slate-500 font-bold">
                      <CheckCircle className="h-4 w-4 mr-1" /> Local Sandbox Mode
                    </span>
                  )}
                </div>
              </div>

              {/* Theme Settings Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                  {darkMode ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">画面テーマ設定 (Theme)</h3>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {darkMode ? "🌙 ダークモード (Dark Mode)" : "☀️ ライトモード (Light Mode)"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      背景色と文字色の表示モードを切り替えます
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                      darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Gemini Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Gemini API Key</h3>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Gemini Key</label>
                  <input 
                    type="password"
                    placeholder="Gemini APIキーを入力..." 
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    API key is stored locally in your browser's LocalStorage and sent directly to Google APIs.
                  </p>
                </div>
              </div>

              {/* CSV Data Batch Import */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Data Management & Batch Import (データ一括インポート)
                  </h3>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  CSVファイルをアップロードして、複数のスタートアップを一括でデータベースへ登録します。
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={downloadImportTemplate}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5 min-h-[38px]"
                  >
                    <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>雛形CSVをダウンロード</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    CSVファイルを指定
                  </label>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleCSVFileChange}
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                {/* Parsed Preview */}
                {csvParsedData.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span>検出結果 ({csvParsedData.length}件)</span>
                      <button
                        type="button"
                        onClick={handleExecuteBatchImport}
                        disabled={isImporting}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center space-x-1 disabled:opacity-50 min-h-[36px]"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{isImporting ? '登録中...' : `${csvParsedData.length}件を一括登録`}</span>
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {csvParsedData.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-emerald-500/10 pb-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <span className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{item.sector} / {item.stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Firebase Cloud Database Configuration */}
              {/* Firebase Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Database className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Firebase Web Config</h3>
                  </div>
                  {currentUser?.email === 'nasse0326@gmail.com' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      管理者権限 (Admin)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                      🔒 閲覧のみ (Read Only)
                    </span>
                  )}
                </div>

                {currentUser?.email !== 'nasse0326@gmail.com' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                    🔒 データベース接続設定はシステム管理者（nasse0326@gmail.com）のみ変更可能です。一般メンバーは編集できません。
                  </p>
                )}

                <fieldset disabled={currentUser?.email !== 'nasse0326@gmail.com'} className="space-y-3.5 text-xs disabled:opacity-60">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase">API Key</label>
                    <input 
                      type="text" 
                      placeholder="apiKey" 
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase">Project ID</label>
                    <input 
                      type="text" 
                      placeholder="projectId" 
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase">Auth Domain</label>
                    <input 
                      type="text" 
                      placeholder="authDomain (optional)" 
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase">Storage Bucket</label>
                    <input 
                      type="text" 
                      placeholder="storageBucket (optional)" 
                      value={fbStorageBucket}
                      onChange={(e) => setFbStorageBucket(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 dark:text-slate-400 uppercase">App ID</label>
                    <input 
                      type="text" 
                      placeholder="appId (optional)" 
                      value={fbAppId}
                      onChange={(e) => setFbAppId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 text-sm disabled:cursor-not-allowed"
                    />
                  </div>
                </fieldset>
              </div>

              {/* Action Buttons (Min 44x44px target) */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
                >
                  Apply Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Team / Workspace Modal dialogue Box */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Workspace Collaboration Teams</span>
              </h2>
              <button 
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all min-h-[40px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* Form 1: Create a Team */}
              <form onSubmit={handleCreateTeam} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Create a New Team Workspace</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generate a secure workspace to collaborate with others.</p>
                </div>
                
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input 
                    type="text" 
                    placeholder="e.g. CVC Alpha Team" 
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={teamFormLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm transition-all min-h-[40px] text-xs shrink-0 flex items-center justify-center"
                  >
                    Create
                  </button>
                </div>
              </form>

              {/* Form 2: Join a Team */}
              <form onSubmit={handleJoinTeam} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Join Workspace via Invite Code</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter a 6-character team invite code.</p>
                </div>
                
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input 
                    type="text" 
                    placeholder="e.g. AB4C9D" 
                    required
                    maxLength={10}
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100 text-sm uppercase tracking-widest text-center"
                  />
                  <button
                    type="submit"
                    disabled={teamFormLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm transition-all min-h-[40px] text-xs shrink-0 flex items-center justify-center"
                  >
                    Join Team
                  </button>
                </div>
              </form>

              {/* Active Teams list */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider text-xs">My Registered Workspaces ({myTeams.length + 1})</h3>
                
                <div className="space-y-2">
                  {/* Personal space */}
                  <div className="flex justify-between items-center p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                    <div className="flex items-center space-x-2">
                      <User className="h-4.5 w-4.5 text-slate-450" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-xs">Personal Workspace</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Private data only visible to you</span>
                      </div>
                    </div>
                    {activeWorkspaceId.startsWith('personal_') && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>

                  {/* Team Workspaces */}
                  {myTeams.map(t => (
                    <div 
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="h-4.5 w-4.5 text-blue-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-xs">{t.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">Shared workspace ({t.members?.length || 1} members)</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => handleCopyInvite(t.inviteCode)}
                          className="flex items-center space-x-1 text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded hover:scale-105 transition-all"
                          title="Click to copy invite code"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Code: {t.inviteCode}</span>
                        </button>

                        {activeWorkspaceId === t.id && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Floating Toast Notification Box */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm rounded-2xl shadow-xl border bg-white dark:bg-slate-900 p-4 flex items-center space-x-3 border-slate-200 dark:border-slate-850 animate-scale-up">
          {toast.type === 'success' && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
          {toast.type === 'error' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />}
          {toast.type === 'warning' && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
          {toast.type === 'info' && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
          <p className="text-xs font-bold text-slate-850 dark:text-slate-100">{toast.message}</p>
        </div>
      )}

      {/* Mobile Responsive Bottom Tab Bar (Min 44x44px target) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/80 dark:border-slate-850 backdrop-blur-md lg:hidden h-16 flex items-center justify-around px-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'directory', label: 'Startups', icon: Database },
          { id: 'meetings', label: 'Meetings', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center space-y-0.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all min-h-[44px] min-w-[64px] ${
              activeTab === tab.id ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
