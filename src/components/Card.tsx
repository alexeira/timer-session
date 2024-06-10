interface CardProps {
  children: React.ReactNode
  title?: string
}

export default function Card({ children, title = 'test' }: CardProps) {
  return (
    <article className="bg-slate-950/70 p-3 w-[200px] h-[150px] rounded-md shadow-sm grid grid-rows-[35px,auto]">
      <header className="text-left">
        <code className="bg-cyan-950/55 py-1 px-2.5 rounded-xl">{title}</code>
      </header>
      <section className="grid place-items-center">{children}</section>
    </article>
  )
}
