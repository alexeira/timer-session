import { useSessionTime } from '../hooks/useSessionTime'
import { useTab } from '../hooks/useTab'

export default function SessionTime() {
  const { sessionTime, userEvents, inactiveTime } = useSessionTime()
  const numberOfTabs = useTab()

  function formatTime(time: number): string {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0')
    const seconds = String(time % 60).padStart(2, '0')

    return `${time > 60 ? `${minutes}:` : ''}${seconds}`
  }

  const formatedTime = formatTime(sessionTime)
  const formatedInactiveTime = formatTime(inactiveTime)

  return (
    <>
      <section>
        <p>{formatedTime} de sesion</p>
        <p>{userEvents.keydownAmount} teclas presionadas</p>
        <p>{userEvents.clickAmount} clicks presionados</p>
        <p>{userEvents.scrollAmount} scroll hechos</p>
        <p>{formatedInactiveTime} de inactividad</p>
        <p>numero de pestañas: {numberOfTabs}</p>
      </section>
    </>
  )
}
