import React from 'react';
import { cn } from '../../../lib/utils';

type Step = {
  id: string;
  name: string;
  description?: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          const isUpcoming = stepIdx > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                stepIdx !== steps.length - 1 ? 'flex-1' : '',
                'relative'
              )}
              onClick={() => onStepClick?.(stepIdx)}
            >
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-4 -ml-px h-0.5 w-full',
                    isCompleted ? 'bg-primary' : 'bg-gray-200',
                    isCurrent ? 'bg-gray-200' : ''
                  )}
                  aria-hidden="true"
                />
              )}
              <div className="group flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    isCompleted
                      ? 'border-primary bg-primary group-hover:bg-primary/80'
                      : isCurrent
                      ? 'border-primary bg-white'
                      : 'border-gray-300 bg-white group-hover:border-gray-400',
                    'transition-colors duration-200 ease-in-out',
                    onStepClick ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary' : 'text-gray-500'
                      )}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'mt-2 text-center text-sm font-medium',
                    isCurrent ? 'text-primary' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
                {step.description && (
                  <span className="mt-1 text-center text-xs text-gray-500">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default Stepper;
