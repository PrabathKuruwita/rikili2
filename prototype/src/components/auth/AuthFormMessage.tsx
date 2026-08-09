type AuthFormMessageTone = 'error' | 'success';

const toneClass: Record<AuthFormMessageTone, string> = {
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

export function AuthFormMessage({
  tone,
  message,
}: {
  tone: AuthFormMessageTone;
  message: string;
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm ${toneClass[tone]}`}
    >
      {message}
    </p>
  );
}
