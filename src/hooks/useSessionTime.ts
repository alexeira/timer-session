import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const LIMIT_TO_SEND = 10 // 10 min
const SESSION_TIME_KEY = 'sessionTime'
const INACTIVE_TIME_KEY = 'inactiveTime'
const INACTIVITY_LIMIT_MS = 5000 // 5 seg
const INACTIVE_STATUS_KEY = 'inactive'

export function useSessionTime() {
  const [sessionDate, setSessionDate] = useState(() => new Date())
  const [sessionTime, setSessionTime] = useState(0)
  const [inactiveTime, setInactiveTime] = useState(0)
  const [isInactive, setIsInactive] = useState(() => {
    const status = localStorage.getItem(INACTIVE_STATUS_KEY)

    return Boolean(status) ?? true
  })
  const [sendStatus, setSendStatus] = useState('recopilando datos')
  const intervalRef = useRef(null)
  const inactivityTimerRef = useRef(null)
  const [userEvents, setUserEvents] = useState(() => {
    const events = localStorage.getItem('userEvents')

    return events ? JSON.parse(events) : { clickAmount: 0, keydownAmount: 0, scrollAmount: 0 }
  })

  const [isWindowHidden, setIsWindowHidden] = useState(document.hidden)

  const sessionStatus = useMemo(() => {
    if (isWindowHidden || isInactive) return 'inactive'

    return 'active'
  }, [isWindowHidden, isInactive])

  // envia los datos y limpia el estado y el localStorage
  const sendDataAndClear = useCallback(() => {
    if (sessionTime === 0) return

    if (sessionStatus === 'inactive' && inactiveTime >= LIMIT_TO_SEND) {
      console.log('datos enviados')
      setSendStatus('datos enviados')
      setSessionTime(0) // Limpiar estado
      setInactiveTime(0) // Limpiar estado
      setIsInactive(false)
      setUserEvents({ clickAmount: 0, keydownAmount: 0, scrollAmount: 0 }) // Limpiar estado
      localStorage.setItem(SESSION_TIME_KEY, String(0))
      localStorage.setItem(INACTIVE_TIME_KEY, String(0)) // Limpiar localStorage
      localStorage.setItem(INACTIVE_STATUS_KEY, String(false)) // Limpiar localStorage
      localStorage.setItem(
        'userEvents',
        JSON.stringify({ clickAmount: 0, keydownAmount: 0, scrollAmount: 0 })
      ) // Limpiar localStorage
    }
  }, [sessionTime, inactiveTime, sessionStatus])

  // inicia el tiempo de inactividad luego de 5 seg
  const startInactiviyTime = () => {
    clearTimeout(inactivityTimerRef.current)
    setIsInactive(false)
    localStorage.setItem(INACTIVE_STATUS_KEY, 'false')
    setInactiveTime(0)

    localStorage.removeItem(INACTIVE_TIME_KEY)

    inactivityTimerRef.current = setTimeout(() => {
      setIsInactive(true)
      localStorage.setItem(INACTIVE_STATUS_KEY, 'true')
    }, INACTIVITY_LIMIT_MS)
  }

  // funcion para incrementar el tiempo de sesion
  const incrementSessionTime = useCallback(() => {
    setSessionTime(prevTime => {
      const newTime = prevTime + 1

      localStorage.setItem(SESSION_TIME_KEY, newTime.toString())

      return newTime
    })
  }, [])

  // effect para iniciar el tiempo de sesion
  useEffect(() => {
    if (sendStatus === 'datos enviados') return

    if (intervalRef.current) return // si ya esta corriendo
    intervalRef.current = setInterval(incrementSessionTime, 1000)

    return () => clearInterval(intervalRef.current)
  }, [incrementSessionTime, sendStatus])

  // effect para incrementar el tiempo inactivo
  useEffect(() => {
    if (!isInactive) return

    if (sendStatus === 'datos enviados') return

    const interval = setInterval(() => {
      setInactiveTime(prevTime => {
        const newTime = prevTime + 1

        localStorage.setItem(INACTIVE_TIME_KEY, newTime.toString())

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isInactive, sendStatus])

  // envia la data si se cumplen las condiciones
  useEffect(() => {
    sendDataAndClear()
  }, [sendDataAndClear])

  // actualiza el tiempo de sesion si hay eventos del usuario
  useEffect(() => {
    const handleUserEvents = event => {
      startInactiviyTime()
      setSendStatus('recopilando datos')
      setUserEvents(prevEvents => {
        const newEvents = {
          ...prevEvents,
          [`${event.type}Amount`]: prevEvents[`${event.type}Amount`] + 1
        }

        localStorage.setItem('userEvents', JSON.stringify(newEvents))

        return newEvents
      })
    }

    document.addEventListener('keydown', handleUserEvents)
    document.addEventListener('click', handleUserEvents)
    document.addEventListener('scroll', handleUserEvents)

    return () => {
      document.removeEventListener('keydown', handleUserEvents)
      document.removeEventListener('click', handleUserEvents)
      document.removeEventListener('scroll', handleUserEvents)
    }
  }, [])

  // actualiza el estado de la ventana si se minimiza
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsWindowHidden(document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // actualiza los eventos de usuario entre tabs
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'userEvents') {
        setUserEvents(JSON.parse(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // actualiza el tiempo de sesion entre tabs
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === SESSION_TIME_KEY) {
        setSessionTime(Number(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // actualiza el tiempo de inactividad entre tabs
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === INACTIVE_TIME_KEY) {
        setInactiveTime(Number(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // mantiene el estado inactivo entre pestañas
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === INACTIVE_STATUS_KEY) {
        setIsInactive(Boolean(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // envia si el usuario cierra la ventana bajo condiciones
  useEffect(() => {
    const handleBeforeUnload = () => {
      sendDataAndClear()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionTime, sendDataAndClear])

  return { sessionTime, userEvents, inactiveTime }
}
