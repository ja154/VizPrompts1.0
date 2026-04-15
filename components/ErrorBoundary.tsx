
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
          <div className="max-w-md w-full glassmorphic-card rounded-[2.5rem] p-10 text-center space-y-8 border-rose-500/20 bg-rose-500/5">
            <div className="size-20 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest font-heading text-white">System Critical Error</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                The Studio Intelligence engine encountered a fatal exception. Our engineers have been notified.
              </p>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-left">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Error Log</p>
                <p className="text-xs font-mono text-slate-500 break-all">
                  {this.state.error?.message || 'Unknown runtime error'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-white text-background-dark rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:bg-slate-200 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Reboot System
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
