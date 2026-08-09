import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, ChevronRightIcon } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  HealthRing,
  Badge } from
'../components/ui/primitives';
import { fmtDate } from '../components/shared/helpers';
import { vehicles } from '../data/mockData';
import { useApp } from '../context/AppContext';
export function Vehicles() {
  const { toast } = useApp();
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Vehicles"
        subtitle="Manage your garage, health status, and upcoming service dates."
        action={
        <Button onClick={() => toast('Add vehicle (demo)')}>
            <PlusIcon className="h-4 w-4" />
            Add vehicle
          </Button>
        } />
      

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v, i) =>
        <motion.div
          key={v.id}
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: i * 0.06
          }}>
          
            <Link to={`/vehicles/${v.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-pop">
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                  src={v.imageUrl}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        {v.nickname}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {v.year} {v.make} {v.model}
                      </p>
                    </div>
                    <HealthRing score={v.healthScore} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-400">Plate</dt>
                      <dd className="font-medium text-slate-700">{v.plate}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Mileage</dt>
                      <dd className="font-medium text-slate-700">
                        {v.mileage.toLocaleString()} mi
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Next service</dt>
                      <dd className="font-medium text-slate-700">
                        {fmtDate(v.nextServiceDue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Color</dt>
                      <dd className="font-medium text-slate-700">{v.color}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <Badge
                    tone={
                    v.healthScore >= 80 ?
                    'green' :
                    v.healthScore >= 65 ?
                    'amber' :
                    'red'
                    }>
                    
                      {v.healthScore >= 80 ?
                    'Healthy' :
                    v.healthScore >= 65 ?
                    'Needs attention' :
                    'Service soon'}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                      Details <ChevronRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}
      </div>
    </div>);

}