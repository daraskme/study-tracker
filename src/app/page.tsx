import StudyTrackerApp from './components/StudyTrackerApp'

export default function Home() {
  return (
    <div>
      {/* ヘッダー */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b">
        <h1 className="text-lg font-bold text-black">Study Tracker</h1>
        <nav>
          <a 
            href="https://x.com/darask0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mr-4 text-blue-500 hover:underline"
          >
            X
          </a>
          <a 
            href="https://github.com/daraskme" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* メイン */}
      <main className="p-6">
        <StudyTrackerApp />
      </main>
    </div>
  )
}
