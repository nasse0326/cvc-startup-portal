import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  Loader2,
  Database
} from 'lucide-react';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={props.className} {...props}>
    <path
      fill="#EA4335"
      d="M12 5.04c1.67 0 3.19.57 4.38 1.69l3.27-3.27C17.68 1.54 15.03 1 12 1 7.24 1 3.2 3.74 1.29 7.74l3.87 3C6.11 7.74 8.84 5.04 12 5.04z"
    />
    <path
      fill="#4285F4"
      d="M23.45 12.27c0-.82-.07-1.64-.22-2.45H12v4.64h6.43c-.28 1.47-1.11 2.71-2.36 3.55l3.87 3c2.26-2.09 3.51-5.18 3.51-8.74z"
    />
    <path
      fill="#FBBC05"
      d="M5.16 14.74c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41l-3.87-3C.47 8.52 0 10.21 0 12s.47 3.48 1.29 5.08l3.87-3.26z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.87-3c-1.1.74-2.5 1.18-4.09 1.18-3.16 0-5.89-2.7-6.84-5.7l-3.87 3C3.2 20.26 7.24 23 12 23z"
    />
  </svg>
);
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginMockUser,
  isFirebaseConfigured
} from '../services/firebase';

export default function Login({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasFirebase = isFirebaseConfigured();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (hasFirebase) {
        let userCredential;
        if (isRegister) {
          userCredential = await registerWithEmail(email, password);
          showToast("Account created successfully!", "success");
        } else {
          userCredential = await loginWithEmail(email, password);
          showToast("Welcome back!", "success");
        }
        onLoginSuccess(userCredential.user);
      } else {
        // Local sandbox mock login
        const mockUser = loginMockUser(email);
        showToast("Logged in as Guest User (Sandbox Mode)", "info");
        onLoginSuccess(mockUser);
      }
    } catch (err) {
      console.error(err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/invalid-credential') friendlyMessage = "メールアドレスまたはパスワードが正しくありません。";
      else if (err.code === 'auth/email-already-in-use') friendlyMessage = "このメールアドレスは既に登録されています。";
      else if (err.code === 'auth/weak-password') friendlyMessage = "パスワードは6文字以上で入力してください。";
      else if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        friendlyMessage = `APIキーが無効です (${err.code}): 設定画面から正しいFirebase設定を入力してください。`;
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        friendlyMessage = `ドメイン未承認 (${err.code}): Firebaseコンソールの Authentication > 設定 > 承認済みドメイン に localhost を追加してください。`;
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = `ログイン方法が無効 (${err.code}): Firebaseコンソールの Authentication > Sign-in method を有効にしてください。`;
      } else {
        friendlyMessage = `エラーが発生しました (${err.code}): ${err.message}`;
      }
      setErrorMessage(friendlyMessage);
      showToast(friendlyMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (hasFirebase) {
        const userCredential = await loginWithGoogle();
        showToast("Signed in with Google!", "success");
        onLoginSuccess(userCredential.user);
      } else {
        // Fallback mock google login
        const mockUser = loginMockUser("google-guest@cvc.local");
        showToast("Logged in as Google Guest (Sandbox Mode)", "info");
        onLoginSuccess(mockUser);
      }
    } catch (err) {
      console.error(err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        friendlyMessage = `APIキーが無効です (${err.code}): 設定画面から正しいFirebase設定を入力してください。`;
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        friendlyMessage = `ドメイン未承認 (${err.code}): Firebaseコンソールの Authentication > 設定 > 承認済みドメイン に localhost と現在のドメインを追加してください。`;
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = `ログイン方法が無効 (${err.code}): Firebaseコンソールの Authentication > Sign-in method で「Google」を有効にしてください。`;
      } else {
        friendlyMessage = `エラーが発生しました (${err.code}): ${err.message}`;
      }
      setErrorMessage(friendlyMessage);
      showToast(friendlyMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Glow effects in Dark Mode */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 p-8 shadow-xl backdrop-blur relative animate-scale-up">
        
        {/* Logo and Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex bg-gradient-to-tr from-blue-600 to-indigo-650 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/10 mx-auto">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Antigravity CVC Portal</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Startups, Pipeline Meetings, and AI Synergy Briefings
            </p>
          </div>
        </div>

        {/* Sandbox Status Alert */}
        {!hasFirebase && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs space-y-1.5 flex items-start">
            <Database className="h-4.5 w-4.5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Local Sandbox Mode Active</span>
              No Firebase configuration detected. You can sign in with any email (no password check) to test workspaces in local storage.
            </div>
          </div>
        )}

        {/* Error message panel */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="email" 
                required
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all placeholder-slate-450"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {hasFirebase ? "Password" : "Password (Optional in Sandbox)"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="password" 
                required={hasFirebase}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm transition-all placeholder-slate-450"
              />
            </div>
          </div>

          {/* Primary Action Button (Min 44x44px target) */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all min-h-[44px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? "Create SaaS Account" : "Sign In to Portal"}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Or Continue With</span>
        </div>

        {/* Google OAuth (Min 44x44px target) */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 font-semibold transition-all min-h-[44px]"
        >
          <GoogleIcon className="h-5 w-5 mr-1" />
          <span>Sign In with Google</span>
        </button>

        {/* Toggle signin vs register link (Min 44x44px target) */}
        {hasFirebase && (
          <div className="mt-6 text-center text-xs">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage('');
              }}
              className="text-blue-600 hover:underline dark:text-blue-400 font-bold py-2 px-4 min-h-[44px]"
            >
              {isRegister ? "Already have an account? Sign In" : "New to the platform? Create account"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
