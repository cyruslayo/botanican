'use client';
import { useState } from 'react';

interface DrawLevel {
  id: string;
  label: string;
  fillPct: number;
  description: string;
}

const DRAW_LEVELS: DrawLevel[] = [
  {
    id: 'quarter',
    label: '¼ draw',
    fillPct: 25,
    description: 'A modest visual level for light routines and initial exploration.',
  },
  {
    id: 'half',
    label: '½ draw',
    fillPct: 50,
    description: 'A balanced midpoint visual draw level.',
  },
  {
    id: 'three-quarter',
    label: '¾ draw',
    fillPct: 75,
    description: 'A higher visual level within the pipette chamber.',
  },
  {
    id: 'full',
    label: 'Full draw',
    fillPct: 100,
    description: 'A complete visual draw into the dropper tube.',
  },
];

export default function InteractiveDropperMath() {
  const [selectedId, setSelectedId] = useState('half');

  const currentLevel = DRAW_LEVELS.find((lvl) => lvl.id === selectedId) ?? DRAW_LEVELS[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Pipette Interactive Visual Column */}
      <div className="lg:col-span-5 flex flex-col items-center sm:items-start bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow">
        <div className="w-full flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-6">
          <div>
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary block">
              Dropper
            </span>
            <span className="font-headline-sm text-primary font-bold">
              Visual Reference
            </span>
          </div>
          <span className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-bold">
            {currentLevel.label}
          </span>
        </div>

        <p className="font-body-sm text-on-surface-variant mb-6 text-sm">
          Select a level to preview the visual liquid height in the dropper.
        </p>

        {/* Pipette Graphic Container */}
        <div className="flex items-center justify-center sm:justify-start gap-8 w-full py-4">
          {/* Glass Pipette - Unmarked, without graduation hash marks or ml text */}
          <div className="relative flex flex-col items-center select-none" style={{ height: '320px', width: '60px' }}>
            {/* Rubber Bulb at top */}
            <div
              className="w-10 h-14 rounded-t-full bg-primary relative shadow-md transition-transform duration-200 active:scale-95 cursor-pointer"
              title="Rubber bulb"
            >
              <div className="absolute inset-x-2 bottom-1 h-3 rounded-sm bg-primary/80 border-t border-white/20"></div>
            </div>

            {/* Collar */}
            <div className="w-6 h-3 bg-surface-container-highest border border-outline rounded-t-sm z-10 shadow-sm"></div>

            {/* Smooth unmarked glass chamber (no hash marks) */}
            <div className="relative w-7 flex-1 border-x border-b border-outline/70 bg-gradient-to-r from-surface/80 via-white/40 to-surface/90 rounded-b-xl overflow-hidden backdrop-blur-sm shadow-inner">
              {/* Glass reflection highlight */}
              <div className="absolute top-0 bottom-0 left-1 w-1 bg-white/60 z-20 pointer-events-none rounded-full"></div>

              {/* Smooth Liquid Column */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/90 via-secondary/70 to-secondary/50 transition-all duration-500 ease-out z-10"
                style={{ height: `${currentLevel.fillPct}%` }}
              >
                {/* Meniscus curve */}
                <div className="absolute -top-1.5 inset-x-0 h-3 bg-secondary/80 rounded-[50%] opacity-90 shadow-sm"></div>
                {/* Micro shimmer */}
                <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/40 animate-pulse"></div>
                <div className="absolute bottom-6 right-2 w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:300ms]"></div>
              </div>
            </div>

            {/* Pipette Taper Tip */}
            <div className="w-2.5 h-6 bg-gradient-to-b from-surface/90 to-surface/40 border-x border-b border-outline/70 rounded-b-md relative overflow-hidden">
              <div
                className="absolute inset-x-0 bottom-0 bg-secondary/80 transition-all duration-500"
                style={{ height: currentLevel.fillPct > 0 ? '100%' : '0%' }}
              ></div>
            </div>

            {/* Hanging Droplet indicator when filled */}
            <div
              className={`w-2 h-2.5 rounded-full bg-secondary transition-all duration-300 transform mt-0.5 ${
                currentLevel.fillPct > 0 ? 'opacity-90 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-50'
              }`}
            ></div>
          </div>

          {/* Selectable Level Buttons */}
          <div className="flex flex-col justify-between h-[230px] my-auto">
            {DRAW_LEVELS.map((lvl) => {
              const active = selectedId === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedId(lvl.id)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all group ${
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
                  <span className="font-label-sm text-xs block leading-tight">{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full pt-4 mt-2 border-t border-outline-variant/40 flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant">
          <span>Unmarked Dropper</span>
          <span className="text-secondary font-bold">Visual Guide</span>
        </div>
      </div>

      {/* Guide Explanation Column */}
      <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline-variant/60 botanical-shadow p-6 sm:p-8 space-y-6">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold block mb-1">
            Visual Repeatability
          </span>
          <h3 className="font-headline-sm text-primary font-bold">
            Aim for the same visual fill each time.
          </h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed mt-2">
            The physical dropper is clean glass with no printed lines. Choosing a visual benchmark allows you to evaluate your experience consistently.
          </p>
        </div>

        <div role="group" aria-label="Visual draw selection" className="space-y-3">
          <span className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant font-bold block">
            Select Visual Draw Level
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DRAW_LEVELS.map((lvl) => {
              const selected = lvl.id === selectedId;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedId(lvl.id)}
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

        {/* Selected Level Card */}
        <div className="pt-6 border-t border-outline-variant/40 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
              Current Reference
            </span>
            <span className="font-label-sm text-xs font-bold text-primary">
              {currentLevel.label}
            </span>
          </div>

          <p className="font-display-sm text-display-sm text-primary">
            {currentLevel.label}
          </p>

          <p className="font-body-md text-body-md text-on-surface-variant">
            {currentLevel.description}
          </p>

          <div className="pt-3 mt-3 border-t border-outline-variant/30 text-xs text-on-surface-variant/80">
            <span>Visual levels are approximate references to help you repeat a draw. They are not calibrated volume markings.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
