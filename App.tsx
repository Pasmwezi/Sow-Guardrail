import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { ReportView } from './components/ReportView';
import { Login } from './components/Login';
import { FileData, AnalysisStatus, UserSession } from './types';
import { analyzeSOW } from './services/geminiService';
import { Sparkles, ArrowRight, RefreshCcw, FileText, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
    resetAnalysis();
  };

  const handleFileSelect = (fileData: FileData | null) => {
    setFile(fileData);
    if (!fileData) {
      // Reset state if file is removed
      setStatus(AnalysisStatus.IDLE);
      setReport(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !session) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setReport(null);

    try {
      // Pass the full session object to support multiple providers
      const result = await analyzeSOW(file.content, file.type, session);
      setReport(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setReport(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
  };

  // Determine layout based on state
  const isIdle = status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR;
  const isAnalyzing = status === AnalysisStatus.ANALYZING;
  const isComplete = status === AnalysisStatus.COMPLETE;

  return (
    <Layout session={session} onLogout={handleLogout}>
      {!session ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className={`h-full grid gap-6 transition-all duration-500 ease-in-out ${isComplete ? 'grid-cols-12' : 'grid-cols-1 max-w-2xl mx-auto place-content-center'}`}>
          
          {/* Left Panel / Main Input Area */}
          <div className={`flex flex-col gap-6 transition-all duration-500 ${isComplete ? 'col-span-4' : 'w-full'}`}>
            
            {/* Header text when not complete */}
            {!isComplete && (
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Analyze your Statement of Work</h1>
                <p className="text-slate-600 text-lg">
                  Ensure clarity, completeness, and reduced risk before going to market.
                </p>
              </div>
            )}

            {/* Upload Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {isComplete && <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Source Document</h3>}
              
              <FileUpload 
                onFileSelect={handleFileSelect} 
                selectedFile={file} 
                disabled={isAnalyzing} 
              />

              {/* Action Buttons */}
              {file && isIdle && (
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 group-hover:text-yellow-200 transition-colors" />
                  Analyze Document
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {isAnalyzing && (
                <div className="w-full mt-6 flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-3"></div>
                  <p className="text-brand-700 font-medium animate-pulse">Analyzing SOW structure...</p>
                  <p className="text-xs text-slate-400 mt-1">This usually takes 10-20 seconds</p>
                </div>
              )}

              {isComplete && (
                <button
                  onClick={resetAnalysis}
                  className="w-full mt-6 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Start New Analysis
                </button>
              )}

              {/* Error Display */}
              {status === AnalysisStatus.ERROR && error && (
                 <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm text-center">
                   <p className="font-semibold">Analysis Failed</p>
                   <p>{error}</p>
                   <button onClick={handleAnalyze} className="mt-2 text-xs font-bold underline hover:text-red-800">Try Again</button>
                 </div>
              )}
            </div>

            {/* Feature List (Only show when idle to fill space) */}
            {isIdle && !file && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Clarity Check</h3>
                    <p className="text-xs text-slate-500 mt-1">Identifies ambiguous language and undefined deliverables.</p>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Risk Detection</h3>
                    <p className="text-xs text-slate-500 mt-1">Highlights missing assumptions and commercial risks.</p>
                 </div>
              </div>
            )}
          </div>

          {/* Right Panel / Report Area */}
          {isComplete && report && (
            <div className="col-span-8 h-full animate-slideInRight">
              <ReportView markdown={report} />
            </div>
          )}

        </div>
      )}
    </Layout>
  );
};

export default App;