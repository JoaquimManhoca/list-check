import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('checklist')
    return saved ? JSON.parse(saved) : []
  })
  const [newItem, setNewItem] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(isStandalone)

    const handler = (e) => {
      e.preventDefault()
      console.log('beforeinstallprompt capturado:', e)
      setDeferredPrompt(e)
      setDebugInfo('Prompt disponível!')
    }
    window.addEventListener('beforeinstallprompt', handler)
    
    window.addEventListener('appinstalled', () => {
      console.log('App instalado!')
      setIsInstalled(true)
      setDebugInfo('Instalado!')
    })
    
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setDebugInfo('Sem prompt disponível')
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('Outcome:', outcome)
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
    setShowInstall(false)
  }

  const [showInstall, setShowInstall] = useState(false)

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem.trim(), checked: false }])
      setNewItem('')
    }
  }

  const toggleItem = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const showInstallButton = !isInstalled && (deferredPrompt || showInstall)

  return (
    <div className="app">
      <h1>Checklist</h1>
      <div className="input-group">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Nova tarefa..."
        />
        <button onClick={addItem}>Adicionar</button>
      </div>
      <ul className="list">
        {items.map(item => (
          <li key={item.id} className={item.checked ? 'checked' : ''}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.text}</span>
            </label>
            <button className="delete" onClick={() => deleteItem(item.id)}>×</button>
          </li>
        ))}
        {items.length === 0 && <p className="empty">Nenhuma tarefa ainda</p>}
      </ul>
      {showInstallButton && (
        <button className="install-btn" onClick={handleInstall}>
          Instalar App
        </button>
      )}
      {debugInfo && <p className="debug">{debugInfo}</p>}
    </div>
  )
}

export default App