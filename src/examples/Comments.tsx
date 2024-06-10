import { Suspense, use } from 'react'

type PromiseComments = Promise<string[]>

function SkeletonText() {
  return <div className="h-[10px] w-[70px] animate-pulse rounded-md bg-slate-500/55" />
}

function SkeletonComments() {
  return (
    <div className="grid gap-y-3.5">
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  )
}

function CommentsPromise({ commentsPromise }: { commentsPromise: PromiseComments }) {
  const comments = use(commentsPromise)

  return comments.map(comment => <p key={crypto.randomUUID()}>{comment}</p>)
}

export default function Comments() {
  const commentsPromise: PromiseComments = new Promise(resolve => {
    setTimeout(() => {
      resolve(['JavaScript', 'TypeScript', 'Rust'])
    }, 3000)
  })

  return (
    <>
      <Suspense fallback={<SkeletonComments />}>
        <CommentsPromise commentsPromise={commentsPromise} />
      </Suspense>
    </>
  )
}
