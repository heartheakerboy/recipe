import React from 'react';
import { ChefHat, Lightbulb, Clock } from 'lucide-react';
import { RecipeInstruction } from '@/lib/types/recipe';

interface InstructionListProps {
  instructions: RecipeInstruction[];
}

export function InstructionList({ instructions }: InstructionListProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-editorial-text flex items-center gap-2">
        <ChefHat className="w-5 h-5 text-brand-500" />
        <span>How to Make It (Step-by-Step)</span>
      </h3>

      <div className="space-y-6">
        {instructions.map((step) => (
          <div
            key={step.stepNumber}
            id={`step-${step.stepNumber}`}
            className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-editorial-border shadow-sm"
          >
            {/* Step Number Circle */}
            <span className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              {step.stepNumber}
            </span>

            <div className="space-y-2 flex-1">
              {step.title && (
                <h4 className="font-serif text-base sm:text-lg font-bold text-editorial-text">
                  {step.title}
                </h4>
              )}

              <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
                {step.instructionText}
              </p>

              {step.imageUrl && (
                <div className="mt-3 overflow-hidden rounded-xl border border-editorial-border max-w-md shadow-sm">
                  <img
                    src={step.imageUrl}
                    alt={step.imageAlt || `Step ${step.stepNumber} preparation`}
                    loading="lazy"
                    className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {step.tip && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chef Tip:</strong> {step.tip}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
