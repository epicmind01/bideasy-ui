import React from 'react';
import { cn } from '../../../lib/utils';
import { Check } from 'lucide-react';

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
      <ol className="flex w-full">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          const isUpcoming = stepIdx > currentStep;
          const showCheck = stepIdx < currentStep; // Show check for completed steps

          return (
            <li
              key={step.id}
              className={cn(
                'relative',
                stepIdx === 0 ? 'flex-1' : 'flex-1',
                'first:justify-start last:justify-end',
                'flex items-center justify-center'
              )}
              onClick={() => onStepClick?.(stepIdx)}
            >
              {/* Left connector line */}
              {stepIdx > 0 && (
                <div
                  className={cn(
                    'absolute top-4 left-0 right-1/2 h-0.5 z-0',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200',
                    isCurrent ? 'bg-gray-200' : ''
                  )}
                  aria-hidden="true"
                />
              )}
              
              {/* Right connector line */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-1/2 right-0 h-0.5 z-0',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200',
                    isCurrent ? 'bg-gray-200' : ''
                  )}
                  aria-hidden="true"
                />
              )}
              <div className="group flex flex-col items-center relative z-10 w-full">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    isCompleted
                      ? 'border-green-500 bg-green-500 group-hover:bg-green-600'
                      : isCurrent
                      ? 'border-primary bg-white'
                      : 'border-gray-300 bg-white group-hover:border-gray-400',
                    'transition-colors duration-200 ease-in-out',
                    onStepClick ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  {showCheck ? (
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

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <Check {...props} />;

export default Stepper;
