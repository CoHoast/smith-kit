export default function CommitBotPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CommitBot</h1>
          <p className="text-zinc-400">AI-powered commit messages for better git history</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CLI Installation */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">CLI Installation</h3>
          <div className="bg-zinc-950 rounded-xl p-4 font-mono text-sm text-zinc-300">
            <div className="mb-2">npm install -g @smithkit/commitbot</div>
            <div className="mb-2">commitbot init</div>
            <div>git add . && commitbot</div>
          </div>
        </div>

        {/* VS Code Extension */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">VS Code Extension</h3>
          <p className="text-zinc-400 mb-4">Install the SmithKit extension for seamless integration</p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Install Extension
          </button>
        </div>

        {/* Recent Commits */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Generated Commits</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-mono text-sm text-zinc-300">feat: add user authentication with JWT tokens</span>
              <span className="text-xs text-zinc-500 ml-auto">2m ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-mono text-sm text-zinc-300">fix: resolve memory leak in event listeners</span>
              <span className="text-xs text-zinc-500 ml-auto">1h ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-mono text-sm text-zinc-300">docs: update API documentation for v2.0</span>
              <span className="text-xs text-zinc-500 ml-auto">3h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}