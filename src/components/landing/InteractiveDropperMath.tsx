'use client';
import { useState } from 'react';
import { BOTTLE_OPTIONS, BOTTLE_SIZE_ML, DRAW_OPTIONS } from '@/data/landing';

/** Format the calculated reference without unnecessary trailing zeros. */
function formatReferenceMg(value: number): string {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

export default function InteractiveDropperMath() {
  const [bottleId, setBottleId] = useState('50');
  const [drawId, setDrawId] = useState('half');

  const selectedBottle =
    BOTTLE_OPTIONS.find((option) => option.id === bottleId) ?? BOTTLE_OPTIONS[1];
  const selectedDraw =
    DRAW_OPTIONS.find((option) => option.id === drawId) ?? DRAW_OPTIONS[1];

  const fillPercentage = Math.min(100, Math.max(0, selectedDraw.ratio * 100));
  const referenceMg =
    (selectedBottle.totalMg / BOTTLE_SIZE_ML) * selectedDraw.ratio;
  const mgDisplay = formatReferenceMg(referenceMg);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Pipette Interactive Visual Column */}
      <div className="lg:col-span-5 flex flex-col items-center sm:items-start bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow">
        <div className="w-full flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-6">
          <div>
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary block">
              Glass Dropper
            </span>
            <span className="font-headline-sm text-primary font-bold">
              Visual Reference
            </span>
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-surface-container-high text-primary font-bold">
            {selectedDraw.label}
          </span>
        </div>

        <p className="font-body-sm text-on-surface-variant mb-6 text-sm">
          Select a reference level to see the approximate liquid fill height inside the glass chamber.
        </p>

        {/* Pipette Graphic + Reference Selectors Container */}
        <div className="flex items-center justify-center sm:justify-start gap-8 w-full py-4">
          {/* Glass Pipette */}
          <div className="relative flex flex-col items-center select-none" style={{ height: '320px', width: '60px' }}>
            {/* Rubber Bulb at top */}
            <div
              className="w-10 h-14 rounded-t-full bg-primary relative shadow-md transition-transform duration-200 active:scale-95"
              title="Apothecary rubber bulb"
            >
              <div className="absolute inset-x-2 bottom-1 h-3 rounded-sm bg-primary/80 border-t border-white/20"></div>
            </div>

            {/* Glass Neck Collar */}
            <div className="w-6 h-3 bg-surface-container-highest border border-outline rounded-t-sm z-10 shadow-sm"></div>

            {/* Clean Unmarked Glass Tube Body */}
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

          {/* Interactive Reference Selectors */}
          <div className="flex flex-col justify-between h-[230px] my-auto">
            {DRAW_OPTIONS.map((lvl) => {
              const active = drawId === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDrawId(lvl.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group ${
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
                    <span className="font-headline-sm text-xs block leading-tight">{lvl.label}</span>
                    <span className="text-[11px] opacity-80 block leading-tight">Visual reference</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full pt-4 mt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
          <span>Unmarked Glass Dropper</span>
          <span className="text-secondary font-bold">Visual Reference</span>
        </div>
      </div>

      {/* Visual Reference Explanation Card */}
      <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline-variant/60 botanical-shadow p-6 sm:p-8 space-y-6">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold block">
            Visual Reference Guide
          </span>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">
            Visible fill height: {selectedDraw.label}
          </h3>
        </div>

        {/* Bottle Strength Selector */}
        <div role="group" aria-label="Bottle strength" className="space-y-3">
          <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-bold block">
            Bottle strength
          </span>
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {BOTTLE_OPTIONS.map((option) => {
              const selected = option.id === bottleId;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBottleId(option.id)}
                  className={`px-3 py-2 rounded-full font-label-sm text-xs font-bold tracking-wide transition-colors text-center active:scale-[0.98] ${
                    selected
                      ? 'bg-primary/10 text-primary border border-primary/40'
                      : 'border border-outline text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  {option.totalMg} mg bottle
                </button>
              );
            })}
          </div>
        </div>

        <div role="group" aria-label="Reference level selection" className="space-y-3">
          <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-bold block">
            Select Visual Reference State
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DRAW_OPTIONS.map((lvl) => {
              const selected = lvl.id === drawId;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDrawId(lvl.id)}
                  className={`px-3 py-2.5 rounded-xl font-label-sm text-xs font-bold tracking-wide transition-all text-center active:scale-[0.98] ${
                    selected
                      ? 'bg-secondary text-primary font-bold shadow-sm'
                      : 'border border-outline text-primary hover:bg-surface-container'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Level Detail Card */}
        <div className="pt-6 border-t border-outline-variant/40 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold block">
              Calculated reference
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              Approximate visual draw
            </span>
          </div>

          <p className="font-headline-sm text-headline-sm text-primary font-bold">
            {selectedDraw.label}
          </p>

          <p className="font-display-md text-display-md text-primary" aria-live="polite">
            &asymp; {mgDisplay} mg THC
          </p>

          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Based on the selected {selectedBottle.label} bottle.
          </p>

          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            The liquid fills approximately{' '}
            {selectedDraw.id === 'quarter'
              ? 'one quarter'
              : selectedDraw.id === 'half'
                ? 'one half'
                : selectedDraw.id === 'three-quarter'
                  ? 'three quarters'
                  : 'the full height'}{' '}
            of the glass dropper chamber.
          </p>

          <div className="pt-3 border-t border-outline-variant/30 space-y-1.5 text-xs text-on-surface-variant leading-relaxed">
            <p>
              Milligram values are calculated from the selected bottle strength and approximate visual draw.
            </p>
            <p>
              Visual levels are approximate. They are not calibrated volume markings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
