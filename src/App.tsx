import { useState, useEffect } from 'react'
import { PomodoroTimer } from './content/pomodoro/PomodoroTimer'

function App() {
  const [electronVersion, setElectronVersion] = useState<string>('Carregando...')
  console.log(electronVersion)

  useEffect(() => {
    if (window.electronAPI) {
      setElectronVersion(window.electronAPI.getAppVersion())
    }
  }, [])

  return (
    <div className="container max-w-4xl w-full mx-auto p-5 bg-background">
        <PomodoroTimer />
    </div>
  )
}

export default App
