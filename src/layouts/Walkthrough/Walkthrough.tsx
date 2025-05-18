import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button, Icon } from '@fortanix/baklava';
import cl from './Walkthrough.module.scss';
import useScrollLock from '../../util/hooks/useScrollLock';
import { classNames as cx } from '../../util/componentUtil';

console.log(cl)


type Status = 'next' | 'prev' | 'skip' | 'finished';

// Anchor origin for tooltip positioning
type AnchorOrigin = {
  horizontal: 'left' | 'center' | 'right',
  vertical: 'top' | 'center' | 'bottom',
};

// A single walkthrough step
type Step = {
  target: string,
  title?: string,
  description?: string,
  anchorOrigin: AnchorOrigin,
  spotlightPadding?: number,
  disableOverlay?: boolean,
  disableScrolling?: boolean,
  customSkip?: { skip: React.ReactNode },
  offsetLeft?: number,
  offsetTop?: number,
  disableWait?: boolean,
  styles?: React.CSSProperties,
  spotlightStyles?: React.CSSProperties,
}

// Callback function type passed to parent
type CallbackProps = {
  action: Status,
  step: Step,
  index: number,
  status: Status,
  waitForTarget: (onReady: () => void, target?: string) => void,
};

// Props for the main WalkThrough component
type WalkThroughProps = {
  steps: Step[],
  run: boolean,
  stepIndex?: number,
  callback?: (args: CallbackProps) => void,
  renderProps?: (step: Step) => React.ReactNode,
};

// Wait for element to scroll into view and become visible
function waitForScrollIntoView(element: HTMLElement): Promise<DOMRect> {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect();
          resolve(entry.boundingClientRect);
          break;
        }
      }
    }, {
      root: null,
      threshold: 0.6,
    });

    if(element){
      observer.observe(element);
      element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    }
  });
}


// Portal component for rendering outside root DOM tree
const WalkthroughPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portal, setPortal] = React.useState<Element | null>(null);

  React.useEffect(() => {
    setPortal(document.body);
  }, []);

  if (!portal) return null;
  return createPortal(children, portal);
};

// Main WalkThrough component
const WalkThrough: React.FC<WalkThroughProps> = ({
  steps,
  run,
  stepIndex = 0,
  callback,
  renderProps,
}) => {
  const [activeStep, setActiveStep] = React.useState(stepIndex);
  const [targetReady, setTargetReady] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);
  const { enableScrollLock, disableScrollLock } = useScrollLock(cl['bk-walkthrough-open']);

  const currentStep = steps[activeStep];
  const targetElement = currentStep?.target ? document.querySelector(currentStep.target) as HTMLElement : null;

  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [isInViewport, setIsInViewport] = React.useState(false);
  const spotlightPadding = currentStep?.spotlightPadding || 10;
  
    // Check if all required targets exist
    const allTargetsExist = useCallback((target?: string, steps:Step[]) => {
      console.log(document.querySelector('.bk-theme--dark'))
      if (target) return !!document.querySelector(target);
      return steps.every(step => step.disableWait || !!document.querySelector(step.target));
    }, []);
  
    // Wait until target(s) are in the DOM
    const waitForTarget = useCallback((onReady: () => void, target?: string) => {
      if (allTargetsExist(target, steps)) {
        onReady();
        return;
      }
  
      observerRef.current?.disconnect();
      observerRef.current = new MutationObserver(() => {
        if (allTargetsExist(target, steps)) {
          console.log(target)
          observerRef.current?.disconnect();
          onReady();
        }
      });
  
      observerRef.current.observe(document.body, { childList: true, subtree: true });
    }, [allTargetsExist]);

   // Wait until target(s) are in the DOM   
  React.useEffect(() => {
    if (!run || !currentStep) return;
  
    setTargetReady(false); 
  
    waitForTarget(() => {
      setTargetReady(true);
    }, currentStep.target);
  }, [run, currentStep, waitForTarget]);

  // Scroll to target and capture position
  React.useEffect(() => {
    if (!targetElement && !run && !targetReady) return;

    const scrollAndMeasure = async () => {
      const rect = await waitForScrollIntoView(targetElement as HTMLElement);
      const inViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;

      setIsInViewport(inViewport);

      if (inViewport) {
        setRect(rect);
      }
    };

    scrollAndMeasure();
  }, [targetElement, run, targetReady]);

  // Manage scroll locking
  React.useEffect(() => {
    if (run) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      enableScrollLock();
    } else {
      disableScrollLock();
    }

    return disableScrollLock;
  }, [run, enableScrollLock, disableScrollLock]);

  // Focus tooltip for accessibility
  React.useEffect(() => {
    if (run && tooltipRef.current) {
      tooltipRef.current.focus();
    }
  }, [run, activeStep]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!run) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          handleSkip();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (activeStep < steps.length - 1) handleNextStep();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (activeStep > 0) handlePrevStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [run, activeStep, steps.length]);

  // Restore focus to previously focused element
  React.useEffect(() => {
    return () => previouslyFocusedElement.current?.focus();
  }, []);

  // Navigation Handlers
  const handlePrevStep = useCallback(() => {
    setRect(null);
    if(callback){
      callback({
        action: 'prev',
        step: steps[activeStep - 1],
        index: activeStep,
        status: 'prev',
        waitForTarget,
      });
    }
    setActiveStep(prev => prev - 1);
  }, [callback, steps, activeStep, waitForTarget]);

  const handleNextStep = useCallback(() => {
    setRect(null);
    const isFinal = activeStep >= steps.length - 1;
   if(callback){
    callback({
      action: isFinal ? 'finished' : 'next',
      step: steps[activeStep + 1] ?? steps[activeStep],
      index: activeStep,
      status: isFinal ? 'finished' : 'next',
      waitForTarget,
    });
   }
    setActiveStep(prev => prev + 1);
  }, [callback, steps, activeStep, waitForTarget]);

  const handleSkip = useCallback(() => {
    if(callback){
      callback({
        action: 'skip',
        step: steps[activeStep],
        index: activeStep,
        status: 'skip',
        waitForTarget,
      });
    }
  }, [callback, steps, activeStep, waitForTarget]);

  // Tooltip position calculation based on anchor origin
  const getTooltipPosition = useCallback((rect: DOMRect, anchor: AnchorOrigin, pad: number): React.CSSProperties => {
    let position: React.CSSProperties = {};

    // Horizontal placement
    switch (anchor.horizontal) {
      case 'left':
        position.left = rect.left - pad;
        position.transform = 'translateX(-100%)';
        break;
      case 'right':
        position.left = rect.left + rect.width + pad;
        break;
      case 'center':
      default:
        position.left = rect.left + rect.width / 2;
        position.transform = 'translateX(-50%)';
        break;
    }

    // Vertical placement
    switch (anchor.vertical) {
      case 'top':
        position.top = rect.top - pad;
        position.transform = `${position.transform ?? ''} translateY(-100%)`;
        break;
      case 'center':
        position.top = rect.top + rect.height / 2;
        position.transform = `${position.transform ?? ''} translateY(-50%)`;
        break;
      case 'bottom':
      default:
        position.top = rect.bottom + pad;
        break;
    }

    return position;
  }, []);

  if (!run) return null;
  
  console.log(cl)

  return (
    <WalkthroughPortal>
      <div className="bk" aria-hidden={!run}>
        {/* Spotlight */}
        {isInViewport && rect && currentStep && !currentStep?.disableOverlay && (
          <div
            className={cl["bk-walkthrough-spotlight"]}
            style={{
              top: rect.top - spotlightPadding,
              left: rect.left - spotlightPadding,
              width: rect.width + 2 * spotlightPadding,
              height: rect.height + 2 * spotlightPadding,
              ...currentStep.spotlightStyles,
            }}
          />
        )}

        {/* Tooltip */}
        {isInViewport && rect && currentStep && (
          <div
            ref={tooltipRef}
            className={cl["bk-walkthrough-tooltip"]}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
            aria-describedby="walkthrough-description"
            style={{
              ...getTooltipPosition(rect, currentStep.anchorOrigin, spotlightPadding),
              ...currentStep.styles,
            }}
          >
            <div className={cl[`bk-walkthrough-tooltip-arrow arrow-${currentStep.anchorOrigin.horizontal}-${currentStep.anchorOrigin.vertical}`]} />
            {renderProps ? renderProps(currentStep) : (
              <>
                <div className={cl["bk-walkthrough-tooltip-header"]}>
                  <h5 id="walkthrough-title">{currentStep.title}</h5>
                  <Icon
                    role="button"
                    icon="cross-thin"
                    className={cl["close-icon"]}
                    onClick={handleSkip}
                    aria-label="Close Walkthrough"
                  />
                </div>
                <div id="walkthrough-description" className={cl["bk-walkthrough-tooltip-content"]}>
                  {currentStep.description}
                </div>
                <div className={cl["bk-walkthrough-tooltip-footer"]}>
                  <div className={cl["bk-walkthrough-tooltip-footer-step-count"]}>
                    {activeStep + 1}/{steps.length}
                  </div>
                  <div className={cl["bk-walkthrough-tooltip-footer-action-btns"]}>
                    {activeStep > 0 && (
                      <Button onClick={handlePrevStep}>Previous</Button>
                    )}
                    <Button primary onClick={handleNextStep}>
                      {activeStep < steps.length - 1 ? "Next" : "Finish"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Overlay background */}
        <div className={cl["bk-custom-walkthrough-overlay"]} />
      </div>
    </WalkthroughPortal>
  );
};

export { WalkThrough, type Step, type CallbackProps };
