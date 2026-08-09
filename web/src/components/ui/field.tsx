import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId } from 'react'

const CONTROL =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60'

type FieldProps = {
  label: string
  hint?: string
  error?: string | null
  children: (id: string) => ReactNode
}

/**
 * Label + control + message, with the id wired between them.
 *
 * The control is a render prop taking the generated id rather than a cloned
 * child, so the association is explicit and works for any element.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[CONTROL, 'h-11', className].join(' ')} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={[CONTROL, 'h-11', className].join(' ')} {...props} />
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={[CONTROL, 'py-3', className].join(' ')} {...props} />
}
