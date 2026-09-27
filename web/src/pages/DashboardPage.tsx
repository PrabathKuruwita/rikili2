export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Garaje overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, Daniel
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Here&apos;s what&apos;s happening across your vehicles today.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Book a Service
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-medium text-slate-500">Vehicles</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">3</p>
          <p className="mt-4 text-sm text-slate-600">In your fleet</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-medium text-slate-500">Average Health Score</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">76%</p>
          <p className="mt-4 text-sm text-emerald-600">+3% this week</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-medium text-slate-500">Upcoming Services</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">2</p>
          <p className="mt-4 text-sm text-slate-600">Next 7 days</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-medium text-slate-500">Unread Reminders</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">3</p>
          <p className="mt-4 text-sm text-slate-600">Action needed</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Your vehicles</h2>
            <button type="button" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500">
              View all
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: 'Tesla Model 3',
                model: '2022 Tesla Model 3',
                mileage: '34,210 mi',
                service: 'Service due Aug 12',
                status: 'green',
                plate: '8YKA221',
                image: '/vehicles/tesla-model-3.svg',
              },
              {
                name: 'Toyota RAV4',
                model: '2020 Toyota RAV4',
                mileage: '68,940 mi',
                service: 'Service due Jul 28',
                status: 'orange',
                plate: '4TRB910',
                image: '/vehicles/toyota-rav4.svg',
              },
              {
                name: 'Ford F-150',
                model: '2019 Ford F-150',
                mileage: '91,300 mi',
                service: 'Brake inspection due soon',
                status: 'red',
                plate: '2LMC554',
                image: '/vehicles/ford-f150.svg',
              },
            ].map((vehicle) => (
              <article
                key={vehicle.plate}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_70px_rgba(15,23,42,0.06)]"
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-indigo-100 p-5">
                  <div className="absolute inset-x-8 bottom-8 h-24 rounded-[2rem] bg-white/35 blur-xl" />
                  <div className="absolute right-4 top-4 rounded-full border-4 border-white/90 bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    Healthy
                  </div>
                  <div
                    className={[
                      'absolute right-5 top-5 h-7 w-7 rounded-full border-2 bg-white',
                      vehicle.status === 'green'
                        ? 'border-emerald-500'
                        : vehicle.status === 'orange'
                          ? 'border-orange-400'
                          : 'border-rose-500',
                    ].join(' ')}
                  />
                  <div className="absolute inset-x-10 bottom-8 h-20 rounded-[2rem] border border-white/60 bg-white/55 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
                    <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-contain p-3" />
                  </div>

                  <div className="absolute bottom-4 left-5 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 shadow-sm">
                    {vehicle.plate}
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{vehicle.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{vehicle.model}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {vehicle.mileage}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{vehicle.service}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Upcoming Services</h2>
              <button type="button" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500">
                History
              </button>
            </div>

            {[
              {
                title: 'Emission Test',
                subtitle: 'Work Truck · Golden Gate Service',
                date: 'Jul 19, 2026',
                time: '14:00',
              },
              {
                title: 'Full Service + Oil Change',
                subtitle: 'Weekend SUV · Precision Auto Care',
                date: 'Jul 28, 2026',
                time: '09:30',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                    Upcoming
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  {item.date} · {item.time}
                </p>
              </article>
            ))}
          </section>

          <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Reminders</h2>
              <button type="button" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500">
                All
              </button>
            </div>

            {[
              {
                title: 'Emission test due soon',
                description: 'Work Truck (Ford F-150) emission certificate expires Jul 25.',
              },
              {
                title: 'Service appointment confirmed',
                description: 'Full Service booked at Precision Auto Care on Jul 28, 09:30 AM.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              </article>
            ))}
          </section>
        </aside>
      </section>
    </div>
  )
}