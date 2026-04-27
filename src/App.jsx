import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('checklist')
    return saved ? JSON.parse(saved) : []
  })
  const [newItem, setNewItem] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    setShowInstall(false)
  }

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
      {showInstall && (
        <div className="install-popup">
          <p>Instalar aplicativo?</p>
          <div className="install-buttons">
            <button onClick={handleInstall}>Instalar</button>
            <button onClick={() => setShowInstall(false)}>Mais tarde</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App