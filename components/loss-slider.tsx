"use client";

import { clampPercent, lossTone } from "@/lib/format";

type LossSliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  presets?: { value: number; label: string }[];
  presetsLabel?: string;
};

export function LossSlider({
  id,
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
  minLabel,
  maxLabel,
  presets,
  presetsLabel,
}: LossSliderProps) {
  const percent = clampPercent(value, min, max);
  const tone = lossTone(percent);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span
          className={`rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-base font-semibold tabular-nums ${tone}`}
        >
          {display}
        </span>
      </div>
      <div className="relative flex h-8 items-center rounded-full focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-rose-400/70">
        <div className="absolute h-2 w-full rounded-full bg-white/[0.07] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
        <div
          className="absolute h-2 rounded-full bg-gradient-to-r from-rose-500/60 via-rose-500 to-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.55)]"
          style={{ width: `${percent}%` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-white to-rose-100 shadow-[0_0_0_5px_rgba(244,63,94,0.18),0_4px_14px_rgba(244,63,94,0.5)]"
          style={{ left: `calc(${percent}% - 12px)` }}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      {minLabel || maxLabel ? (
        <div className="mt-1 flex justify-between text-[11px] text-slate-500 tabular-nums">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
      {presets && presets.length > 0 ? (
        <div role="group" aria-label={presetsLabel} className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => {
            const active = preset.value === value;
            return (
              <button
                key={preset.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(preset.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition ${
                  active
                    ? "border-rose-400/50 bg-rose-500/15 text-rose-100"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
