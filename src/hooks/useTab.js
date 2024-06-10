import { useCallback, useEffect, useState } from 'react'

const TAB_KEY = 'mainTab'
const TAB_ID_KEY = 'tabId'
const channel = new BroadcastChannel('tab-count')
// const tabIdChannel = new BroadcastChannel('tab-id')

export function useTab() {
  const [numbOfTabs, setNumbOfTabs] = useState(() => getTabCount())
  // const [tabId, setTabId] = useState(() => getTabId()) // [1, 2, 3, 4, 5]

  function getTabCount() {
    return parseInt(localStorage.getItem(TAB_KEY) || '0', 10)
  }

  /* function getTabId() {
    return JSON.parse(localStorage.getItem(TAB_ID_KEY)) || []
  } */

  /* // handler update tab id
  const updateTabId = useCallback(newTab => {
    setTabId(prevTabId => {
      const newTabId = [...prevTabId, newTab]

      localStorage.setItem(TAB_ID_KEY, JSON.stringify(newTabId))
      tabIdChannel.postMessage(newTabId)

      return newTabId
    })
  }, []) */

  /* // handler remove tab id
  const removeTabId = useCallback(
    tabToRemove => {
      const newTabId = tabId.filter(tab => tab !== tabToRemove)

      localStorage.setItem(TAB_ID_KEY, JSON.stringify(newTabId))
      setTabId(newTabId)
      tabIdChannel.postMessage(newTabId) // Broadcast the new count to other tabs
    },
    [tabId]
  ) */

  // handler update tab count
  const updateTabCount = useCallback(newCount => {
    localStorage.setItem(TAB_KEY, newCount)
    setNumbOfTabs(newCount)
    channel.postMessage(newCount) // Broadcast the new count to other tabs
  }, [])

  // increment tab count and update tab id
  const incrementTabCount = useCallback(() => {
    const newTab = getTabCount() + 1

    updateTabCount(newTab)
    // updateTabId(newTab)
  }, [updateTabCount])

  // decrement tab count and remove tab id
  const decrementTabCount = useCallback(() => {
    const currentCount = getTabCount()
    const newTab = currentCount > 0 ? currentCount - 1 : 0

    updateTabCount(newTab)
    // removeTabId(currentCount)
  }, [updateTabCount])

  useEffect(() => {
    const handleLoad = () => {
      incrementTabCount()
    }

    const handleUnload = () => {
      decrementTabCount()
    }

    const handleStorage = event => {
      if (event.key === TAB_KEY) setNumbOfTabs(getTabCount())
      // else if (event.key === TAB_ID_KEY) setTabId(getTabId())
    }

    const handleBroadcast = event => {
      setNumbOfTabs(event.data)
      // setTabId(event.data)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNumbOfTabs(getTabCount())
        // setTabId(getTabId())
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('beforeunload', handleUnload)
    channel.addEventListener('message', handleBroadcast)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Ensure tab count is incremented on load
    handleLoad()

    return () => {
      handleUnload() // Decrement count on unmount
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('beforeunload', handleUnload)
      channel.removeEventListener('message', handleBroadcast)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [incrementTabCount, decrementTabCount])

  return numbOfTabs
}
