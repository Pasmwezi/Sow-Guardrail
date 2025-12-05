import React from 'react';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { UserSession } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  session?: UserSession | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, session, onLogout }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">SOW Guardian <span className="text-brand-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
             {session ? (
               <div className="flex items-center gap-4 animate-fadeIn">
                 <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-slate-700">{session.name}</span>
                    <span className="text-xs text-slate-500">
                      {session.organization ? `${session.organization} • ` : ''}
                      {session.provider === 'google' ? 'Gemini' : session.provider}
                    </span>
                 </div>
                 <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center border border-brand-200 text-brand-700">
                    <UserIcon className="w-4 h-4" />
                 </div>
                 <div className="h-6 w-px bg-slate-200 mx-1"></div>
                 <button 
                   onClick={onLogout}
                   className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                   title="Sign Out"
                 >
                   <LogOut className="w-4 h-4" />
                   <span className="hidden sm:inline">Sign Out</span>
                 </button>
               </div>
             ) : (
                <div className="text-sm text-slate-500 hidden sm:block">
                  Powered by Gemini 2.5
                </div>
             )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-6">
          {children}
        </div>
      </main>
    </div>
  );
};