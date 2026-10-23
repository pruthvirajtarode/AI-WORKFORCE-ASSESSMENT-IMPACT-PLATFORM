export default function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center">
              <span className="text-brand-navy font-bold text-xl">S×B</span>
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-brand-gold/30 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-2 h-2 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-brand-gold/60 text-sm font-medium tracking-wider uppercase">Loading</p>
      </div>
    </div>
  );
}
