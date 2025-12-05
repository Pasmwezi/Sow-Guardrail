import React, { useState, useEffect } from 'react';
import { User, Key, ArrowRight, ShieldCheck, Server, Cpu, Mail, Lock, Building2 } from 'lucide-react';
import { UserSession } from '../types';

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

const PROVIDERS = [
  { id: 'google', name: 'Google Gemini', defaultModel: 'gemini-2.5-flash', defaultBaseUrl: '', placeholder: 'Leave blank for default' },
  { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-4o', defaultBaseUrl: 'https://api.openai.com/v1', placeholder: 'https://api.openai.com/v1' },
  { id: 'anthropic', name: 'Anthropic Claude', defaultModel: 'claude-3-5-sonnet-20240620', defaultBaseUrl: 'https://api.anthropic.com/v1', placeholder: 'https://api.anthropic.com/v1' },
  { id: 'mistral', name: 'Mistral AI', defaultModel: 'mistral-large-latest', defaultBaseUrl: 'https://api.mistral.ai/v1', placeholder: 'https://api.mistral.ai/v1' },
  { id: 'groq', name: 'Groq', defaultModel: 'llama3-70b-8192', defaultBaseUrl: 'https://api.groq.com/openai/v1', placeholder: 'https://api.groq.com/openai/v1' },
  { id: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-chat', defaultBaseUrl: 'https://api.deepseek.com/v1', placeholder: 'https://api.deepseek.com/v1' },
  { id: 'local', name: 'Local (Ollama/LM Studio)', defaultModel: 'llama3', defaultBaseUrl: 'http://localhost:11434/v1', placeholder: 'http://localhost:11434/v1' },
  { id: 'custom', name: 'Custom OpenAI Compatible', defaultModel: '', defaultBaseUrl: '', placeholder: 'https://your-custom-endpoint/v1' },
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Account State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');

  // Provider State
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('google');
  const [baseUrl, setBaseUrl] = useState('');
  const [customModel, setCustomModel] = useState('');

  // Update defaults when provider changes
  useEffect(() => {
    const selected = PROVIDERS.find(p => p.id === provider);
    if (selected) {
      setBaseUrl(selected.defaultBaseUrl);
      setCustomModel(selected.defaultModel);
    }
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine display name: use Name input if registering, otherwise derive from email or use generic
    const displayName = name.trim() || (email.split('@')[0]) || 'User';

    if (displayName) {
      onLogin({
        name: displayName,
        email: email.trim(),
        organization: organization.trim(),
        apiKey: apiKey.trim() || undefined,
        provider: provider,
        baseUrl: baseUrl.trim() || undefined,
        customModel: customModel.trim() || undefined
      });
    }
  };

  const currentProvider = PROVIDERS.find(p => p.id === provider);
  const showBaseUrl = provider !== 'google';
  const showModel = true;

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] w-full px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-brand-600 px-8 py-8 text-center relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700 opacity-50"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-brand-100 text-sm mt-2 font-medium">
                {isRegistering ? 'Join SOW Guardian AI today' : 'Sign in to continue analysis'}
              </p>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Account Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Account Details
            </h3>
            
            {isRegistering && (
              <div className="space-y-1.5 animate-fadeIn">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required={isRegistering}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
              />
            </div>

            {isRegistering && (
              <div className="space-y-1.5 animate-fadeIn">
                <label htmlFor="org" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Organization <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* LLM Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                 Analysis Engine Configuration
               </h3>
               <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Required</span>
             </div>

             <div className="space-y-1.5">
               <label htmlFor="provider" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                 <Server className="w-4 h-4 text-slate-400" />
                 LLM Provider
               </label>
               <div className="relative">
                 <select 
                   id="provider"
                   value={provider}
                   onChange={(e) => setProvider(e.target.value)}
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 appearance-none"
                 >
                    {PROVIDERS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </select>
                 <div className="absolute right-4 top-3 pointer-events-none">
                   <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {showBaseUrl && (
                <div className="space-y-1.5 animate-fadeIn col-span-2 sm:col-span-1">
                  <label htmlFor="baseUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    API Base URL
                  </label>
                  <input
                    id="baseUrl"
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={currentProvider?.placeholder}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 font-mono text-xs"
                  />
                </div>
              )}

              {showModel && (
                <div className={`space-y-1.5 animate-fadeIn ${showBaseUrl ? 'col-span-2 sm:col-span-1' : 'col-span-2'}`}>
                   <label htmlFor="model" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    Model Name
                  </label>
                  <input
                    id="model"
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. gpt-4, llama3"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 font-mono text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="apiKey" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" />
                API Key <span className="text-xs font-normal text-slate-400 ml-auto bg-slate-100 px-2 py-0.5 rounded-full">
                  {provider === 'local' ? 'Not required' : 'Optional'}
                </span>
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'google' ? "Leave blank to use system default" : "sk-..."}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-4"
          >
            {isRegistering ? 'Create Account' : 'Access Dashboard'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
           <button 
             onClick={() => setIsRegistering(!isRegistering)}
             className="text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors"
           >
             {isRegistering 
               ? "Already have an account? Sign in" 
               : "Don't have an account? Create one"}
           </button>
        </div>
      </div>
      <p className="mt-8 text-sm text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} SOW Guardian. Enterprise Grade Security.
      </p>
    </div>
  );
};