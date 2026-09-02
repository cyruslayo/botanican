'use client';
import { useMemo, useState } from 'react';
import { BOTTLE_OPTIONS, DRAW_OPTIONS, DROPS_PER_ML, BOTTLE_SIZE_ML } from '@/data/landing';

export default function DropperCalculator() {
  const [bottleId, setBottleId] = useState('750');
  const [drawId, setDrawId] = useState('half');

  const bottle = BOTTLE_OPTIONS.find((option) => option.id === bottleId) ?? BOTTLE_OPTIONS[1];
  const draw = DRAW_OPTIONS.find((option) => option.id === drawId) ?? DRAW_OPTIONS[1];

  const { mgPerDraw, drops, label } = useMemo(() => {
    const mgPerMl = bottle.totalMg / BOTTLE_SIZE_ML;
    const mg = mgPerMl * draw.ml;
    return {
      mgPerDraw: Math.round(mg * 10) / 10,
      drops: Math.round(draw.ml * DROPS_PER_ML),
      label: draw.label.toLowerCase(),
    };
  }, [bottle, draw]);

  const mgDisplay = Number.isInteger(mgPerDraw) ? `${mgPerDraw}` : mgPerDraw.toFixed(1);

  return (
    <div className="bg-surface rounded-xl border border-outline-variant/60 botanical-shadow p-6 sm:p-8">
      <div role="group" aria-label="Bottle strength" className="space-y-2">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold block">
          Bottle strength
        </span>
        <div className="flex flex-wrap gap-2">
          {BOTTLE_OPTIONS.map((option) => {
            const selected = option.id === bottleId;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setBottleId(option.id)}
                className={`px-4 py-2 rounded-full font-label-sm text-xs font-bold tracking-wide transition-colors active:scale-[0.98] ${
                  selected ? 'bg-primary text-on-primary' : 'border border-outline text-primary hover:bg-surface-container'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-label="Pipette draw" className="space-y-2 mt-6">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-bold block">
          Pipette draw
        </span>
        <div className="flex flex-wrap gap-2">
          {DRAW_OPTIONS.map((option) => {
            const selected = option.id === drawId;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setDrawId(option.id)}
                className={`px-4 py-2 rounded-full font-label-sm text-xs font-bold tracking-wide transition-colors active:scale-[0.98] ${
                  selected ? 'bg-primary text-on-primary' : 'border border-outline text-primary hover:bg-surface-container'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/40">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold block">
          In this draw
        </span>
        <p className="font-display-md text-display-md text-primary mt-2">
          &asymp; {mgDisplay} mg
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Per {label} draw, about {drops} drops.
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-4">
          Figures assume a standard 20-drops-per-millilitre pipette. Match your batch certificate for exact totals.
        </p>
      </div>
    </div>
  );
}
