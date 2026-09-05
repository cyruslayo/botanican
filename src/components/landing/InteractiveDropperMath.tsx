'use client';
import { useMemo, useState } from 'react';
import { BOTTLE_OPTIONS, DRAW_OPTIONS, DROPS_PER_ML, BOTTLE_SIZE_ML } from '@/data/landing';

const MARKS = [
  { id: 'full', ml: '1.0 ml', label: 'Full pipette', ratio: 1.0, topPct: 0 },
  { id: 'three-quarter', ml: '0.75 ml', label: '¾ pipette', ratio: 0.75, topPct: 25 },
  { id: 'half', ml: '0.5 ml', label: '½ pipette', ratio: 0.5, topPct: 50 },
  { id: 'quarter', ml: '0.25 ml', label: '¼ pipette', ratio: 0.25, topPct: 75 },
];

export default function InteractiveDropperMath() {
  const [bottleId, setBottleId] = useState('50');
  const [drawId, setDrawId] = useState('half');

  const bottle = BOTTLE_OPTIONS.find((option) => option.id === bottleId) ?? BOTTLE_OPTIONS[1];
  const draw = DRAW_OPTIONS.find((option) => option.id === drawId) ?? DRAW_OPTIONS[1];

  const { mgPerDraw, drops, label, fillPercentage } = useMemo(() => {
    const mgPerMl = bottle.totalMg / BOTTLE_SIZE_ML;
    const mg = mgPerMl * draw.ml;
    const fill = Math.min(100, Math.max(0, draw.ml * 100));
    return {
      mgPerDraw: Math.round(mg * 100) / 100,
      drops: Math.round(draw.ml * DROPS_PER_ML),
      label: draw.label.toLowerCase(),
      fillPercentage: fill,
    };
  }, [bottle, draw]);

  const mgDisplay = Number.isInteger(mgPerDraw) ? `${mgPerDraw}` : mgPerDraw.toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Pipette Interactive Visual Column */}
      <div className="lg:col-span-5 flex flex-col items-center sm:items-start bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow">
        <div className="w-full flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-6">
          <div>
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary block">
              Apothecary Pipette
            </span>
            <span className="font-headline-sm text-primary font-bold">
              Calibrated Draw
            </span>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-bold">
            {draw.label} &bull; {draw.ml} ml
          </span>
        </div>

        <p className="font-body-sm text-on-surface-variant mb-6 text-sm">
          Click any graduation mark or level button to draw and see liquid fill the glass chamber.
        </p>

        {/* Pipette Graphic + Marks Container */}
        <div className="flex items-center justify-center sm:justify-start gap-8 w-full py-4">
          {/* Glass Pipette */}
          <div className="relative flex flex-col items-center select-none" style={{ height: '320px', width: '60px' }}>
            {/* Rubber Bulb at top */}
            <div
              className="w-10 h-14 rounded-t-full bg-primary relative shadow-md transition-transform duration-200 active:scale-95 cursor-pointer"
              title="Apothecary rubber bulb"
            >
              <div className="absolute inset-x-2 bottom-1 h-3 rounded-sm bg-primary/80 border-t border-white/20"></div>
            </div>

            {/* Glass Neck Collar */}
            <div className="w-6 h-3 bg-surface-container-highest border border-outline rounded-t-sm z-10 shadow-sm"></div>

            {/* Glass Tube Body (Marks & Fluid) */}
            <div className="relative w-7 flex-1 border-x border-b border-outline/70 bg-gradient-to-r from-surface/80 via-white/40 to-surface/90 rounded-b-xl overflow-hidden backdrop-blur-sm shadow-inner">
              {/* Glass subtle highlight reflection */}
              <div className="absolute top-0 bottom-0 left-1 w-1 bg-white/60 z-20 pointer-events-none rounded-full"></div>

              {/* Liquid Column with animated height */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/90 via-secondary/70 to-secondary/50 transition-all duration-500 ease-out z-10"
                style={{ height: `${fillPercentage}%` }}
              >
                {/* Liquid meniscus curve at top of column */}
                <div className="absolute -top-1.5 inset-x-0 h-3 bg-secondary/80 rounded-[50%] opacity-90 shadow-sm"></div>
                {/* Micro bubbles / shimmer */}
                <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/40 animate-pulse"></div>
                <div className="absolute bottom-6 right-2 w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:300ms]"></div>
              </div>

              {/* Graduation hash lines directly on the glass */}
              {MARKS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDrawId(m.id)}
                  aria-label={`Select ${m.label}`}
                  className="absolute inset-x-0 z-30 group flex items-center justify-end pr-0.5 cursor-pointer focus:outline-none"
                  style={{ top: `${m.topPct}%` }}
                >
                  <div
                    className={`h-[1.5px] transition-all ${
                      drawId === m.id
                        ? 'w-4 bg-primary'
                        : 'w-2.5 bg-outline group-hover:w-3.5 group-hover:bg-secondary'
                    }`}
                  ></div>
                </button>
              ))}
            </div>

            {/* Pipette Taper Tip */}
            <div className="w-2.5 h-6 bg-gradient-to-b from-surface/90 to-surface/40 border-x border-b border-outline/70 rounded-b-md relative overflow-hidden">
              <div
                className="absolute inset-x-0 bottom-0 bg-secondary/80 transition-all duration-500"
                style={{ height: fillPercentage > 0 ? '100%' : '0%' }}
              ></div>
            </div>

            {/* Hanging Droplet indicator when filled */}
            <div
              className={`w-2 h-2.5 rounded-full bg-secondary transition-all duration-300 transform mt-0.5 ${
                fillPercentage > 0 ? 'opacity-90 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-50'
              }`}
            ></div>
          </div>

          {/* Interactive Calibration Mark Selectors */}
          <div className="flex flex-col justify-between h-[230px] my-auto">
            {MARKS.map((m) => {
              const active = drawId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDrawId(m.id)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-all group ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm scale-105 font-bold'
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      active ? 'bg-secondary' : 'bg-outline-variant group-hover:bg-secondary'
                    }`}
                  ></span>
                  <div>
                    <span className="font-mono text-xs block leading-tight">{m.ml}</span>
                    <span className="text-[11px] opacity-80 block leading-tight">{m.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full pt-4 mt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
          <span>Grade: Borosilicate 3.3</span>
          <span className="text-secondary font-bold">10 ml Calibrated</span>
        </div>
      </div>

      {/* Dosing Math & Formula Card Column */}
      <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline-variant/60 botanical-shadow p-6 sm:p-8">
        <div role="group" aria-label="Bottle strength" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-bold block">
              Bottle strength (10 ml Apothecary Flask)
            </span>
            <span className="font-mono text-xs text-secondary font-bold">
              Current Micro-Batch
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BOTTLE_OPTIONS.map((option) => {
              const selected = option.id === bottleId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBottleId(option.id)}
                  className={`p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                    selected
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'border-outline hover:bg-surface-container text-primary'
                  }`}
                >
                  <span className="font-label-sm text-xs font-bold uppercase tracking-wider block">
                    {option.totalMg} mg Active
                  </span>
                  <span
                    className={`font-mono text-xs mt-0.5 block ${
                      selected ? 'text-secondary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    in 10 ml ({option.totalMg / 10} mg / ml)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div role="group" aria-label="Pipette draw selection" className="space-y-3 mt-6">
          <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-bold block">
            Select Pipette Draw Volume
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DRAW_OPTIONS.map((option) => {
              const selected = option.id === drawId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDrawId(option.id)}
                  className={`px-3 py-2.5 rounded-xl font-label-sm text-xs font-bold tracking-wide transition-all text-center active:scale-[0.98] ${
                    selected
                      ? 'bg-secondary text-primary font-bold shadow-sm'
                      : 'border border-outline text-primary hover:bg-surface-container'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculated Result Readout */}
        <div className="mt-8 pt-6 border-t border-outline-variant/40 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
          <div className="flex items-baseline justify-between">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold block">
              Active In This Draw
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              {draw.ml} ml draw volume
            </span>
          </div>

          <p className="font-display-lg md:font-display-xl text-display-lg md:text-display-xl text-primary mt-2">
            &asymp; {mgDisplay} mg
          </p>

          <p className="font-body-md text-body-md text-on-surface-variant mt-2 font-medium">
            Per {label} draw: approximately <span className="font-bold text-primary">{drops} drops</span> in carrier coconut MCT oil.
          </p>

          <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant/80">
            <span>Formula: {bottle.totalMg} mg &divide; 10 ml &times; {draw.ml} ml</span>
            <span className="font-mono font-bold text-primary">&plusmn; 0.05 mg certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
