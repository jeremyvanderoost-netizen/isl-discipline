import { useState } from 'react'
import ClassList from './components/ClassList'
import ClassDetail from './components/ClassDetail'
import TodayDashboard from './components/TodayDashboard'
import HistoryPage from './components/HistoryPage'
import { useApi } from './hooks/useApi'
import { Class } from './types'
import logoInstitut from './assets/logo-institut-saint-louis.png'

type Screen = 'classes' | 'class-detail' | 'history'

export default function App() {
  const [screen, setScreen] = useState<Screen>('classes')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const { request } = useApi<Class>()

  const handleSelectClass = async (classId: number) => {
    const classData = await request(`/api/classes/${classId}`, { method: 'GET' })
    if (classData) {
      setSelectedClass(classData)
      setScreen('class-detail')
    }
  }

  const handleBack = () => {
    setScreen('classes')
    setSelectedClass(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Global Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <img src={logoInstitut} alt="Institut Saint-Louis Bruxelles" className="h-10 w-auto" />
          {screen !== 'history' && (
            <button
              onClick={() => setScreen('history')}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm min-h-[44px]"
            >
              📋 Historique
            </button>
          )}
        </div>
      </header>

      {screen === 'classes' && (
        <>
          <TodayDashboard />
          <ClassList onSelectClass={handleSelectClass} />
        </>
      )}
      {screen === 'class-detail' && selectedClass && (
        <ClassDetail
          classId={selectedClass.id}
          className={selectedClass.name}
          onBack={handleBack}
        />
      )}
      {screen === 'history' && (
        <HistoryPage onBack={() => setScreen('classes')} />
      )}
    </div>
  )
}
