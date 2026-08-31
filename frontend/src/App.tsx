import { useState } from 'react'
import ClassList from './components/ClassList'
import ClassDetail from './components/ClassDetail'
import { useApi } from './hooks/useApi'
import { Class } from './types'

type Screen = 'classes' | 'class-detail'

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
    <>
      {screen === 'classes' && (
        <ClassList onSelectClass={handleSelectClass} />
      )}
      {screen === 'class-detail' && selectedClass && (
        <ClassDetail
          classId={selectedClass.id}
          className={selectedClass.name}
          onBack={handleBack}
        />
      )}
    </>
  )
}
