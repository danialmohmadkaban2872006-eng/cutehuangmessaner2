export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-mesh flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ink-600 to-rose-600 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">花</span>
          </div>
        </div>
        <p className="font-display text-2xl gradient-text font-light tracking-wider">
          Cute Huang
        </p>
        <div className="flex gap-1.5 justify-center mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
