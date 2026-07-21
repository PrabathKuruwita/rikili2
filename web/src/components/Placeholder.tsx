import { useLocation, useParams } from 'react-router-dom'

/**
 * Stand-in for a screen that has not been built yet.
 *
 * Delete this component once every route has a real page — if it still exists
 * at the end of the project, something was missed.
 */
export function Placeholder({ title }: { title: string }) {
  const location = useLocation()
  const params = useParams()

  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">
        Not built yet. Replace this route's element in <code>src/app/router.tsx</code>.
      </p>
      <dl className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <dt className="font-medium text-slate-700">Path</dt>
        <dd className="mb-2 font-mono text-slate-600">{location.pathname}</dd>
        {Object.keys(params).length > 0 && (
          <>
            <dt className="font-medium text-slate-700">Params</dt>
            <dd className="font-mono text-slate-600">{JSON.stringify(params)}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
