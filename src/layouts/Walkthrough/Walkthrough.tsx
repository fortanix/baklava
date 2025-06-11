import React, { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../../components/actions/Button/Button';
import { Icon } from '../../components/graphics/Icon/Icon';
import { Tooltip } from '../../components/overlays/Tooltip/Tooltip';

import cl from './Walkthrough.module.scss';

import useScrollLock from '../../util/hooks/useScrollLock';

type Status = 'next' | 'prev' | 'skip' | 'finished';

// Anchor origin for tooltip positioning
type Placement = 'left'| 'right' | 'top' | 'bottom';

// A single walkthrough step
type Step = {
  target: string,
  title?: string,
  description?: string,
  anchorOrigin: Placement,
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
const waitForScrollIntoView = (element: HTMLElement, scrollableParent?:HTMLElement): Promise<DOMRect> => {
  return new Promise((resolve) => {
   if (!element) return;

   if (scrollableParent) {
     // Scroll to the element
     scrollableParent?.scrollIntoView({
       behavior: 'auto',
       block: 'center',
       inline: 'center',
     });
   } else {
     // Scroll to the element
     element?.scrollIntoView({
       behavior: 'auto',
       block: 'center',
       inline: 'center',
     });
   }

   let frameCount = 0;
   let lastRect = element?.getBoundingClientRect();

   // Check for stable rect after scroll
   const checkStableRect = () => {
     const currentRect = element?.getBoundingClientRect();
     const isStable =
       Math.abs(currentRect.top - lastRect.top) < 1 &&
       Math.abs(currentRect.left - lastRect.left) < 1;

     if (isStable || frameCount > 10) {
       observer.disconnect();
       resolve(currentRect);
     } else {
       lastRect = currentRect;
       frameCount++;
       requestAnimationFrame(checkStableRect);
     }
   };

   // Start observing visibility
   const observer = new IntersectionObserver((entries) => {
     for (const entry of entries) {
       if (entry.isIntersecting) {
         requestAnimationFrame(() => {
           // Wait at least 2 frames for layout stabilization
           requestAnimationFrame(() => {
             checkStableRect();
           });
         });
       }
     }
   }, {
     root: null,
     threshold: 0.6,
   });

   observer.observe(element);
 });
}

const getTooltipVerticalPlacement = (rect: DOMRect, position: React.CSSProperties) => {
  let newPos: React.CSSProperties = {};
  if(rect.top < 100){
    newPos.top = 0;
  } else if(rect.top > (window.innerHeight - 100)) {
    newPos.top = rect.top;
    newPos.transform = `translateY(-50%)`;
  } else {
    newPos.top = rect.top + (rect.height/2);
    newPos.transform = `translateY(-50%)`;
  }
  return {...position, ...newPos};
}

const getTooltipHorizontalPlacement = (rect: DOMRect, position: React.CSSProperties) => {
  let newPos: React.CSSProperties = {};
  if(rect.left < 190){
    newPos.left = 0;
  } else if(rect.left > (window.innerWidth - 380)) {
    newPos.left = rect.left;
    newPos.transform = 'translateX(-50%)';
  } else {
    newPos.left = rect.left + (rect.width/2);
    newPos.transform = 'translateX(-50%)';
  }
  return {...position, ...newPos};
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
  
  const tooltipPlacement: Placement = useMemo(()=>{
    if(!currentStep || !rect) return "right"
    let newAnchor = currentStep?.anchorOrigin;
    const tooltipWidth = 380;
    const screenWidth = window.innerWidth - tooltipWidth;
  
    if(newAnchor === 'left' && rect.left > screenWidth){
      newAnchor = 'right';
    } else if(newAnchor === 'right' && rect.left < 380) {
      newAnchor = 'left';
    } else if(newAnchor === 'bottom' && rect.top < 100) {
      newAnchor = 'top';
    } else if(newAnchor === 'top' && rect.top > (window.innerHeight - 100)) {
      newAnchor = 'bottom';
    }  
    
    return newAnchor;
  },[currentStep, rect])

  // Tooltip position calculation based on anchor origin
  const getTooltipPosition = useCallback((rect: DOMRect, pad: number): React.CSSProperties => {
    let position: React.CSSProperties = {};
    const arrowSize = 12;

    // Tooltip placement
    switch (tooltipPlacement) {
      case 'right':
        position.left = rect.left - arrowSize;
        position.transform = 'translateX(-100%)'; 
        position = getTooltipVerticalPlacement(rect, position);
        // position.top = rect.top + rect.height / 2;
        // position.transform = `${position.transform ?? ''} translateY(-50%)`;
        break;
      case 'left':
        position.left = rect.left + rect.width + pad + arrowSize;
        position.top = rect.top + rect.height / 2;
        position = getTooltipVerticalPlacement(rect, position);
        // position.transform = `${position.transform ?? ''} translateY(-50%)`;
        break;
      case 'bottom':
        position.top = rect.top - pad - arrowSize;
        position.transform = `translateY(-100%)`;
        position = getTooltipHorizontalPlacement(rect, position);
        break;  
      case 'top':
        position.top = rect.bottom + pad + arrowSize;
        position = getTooltipHorizontalPlacement(rect, position);
        break;
      default:
        position.left = rect.left + rect.width + pad + arrowSize;
        position.top = rect.top + rect.height / 2;
        position = getTooltipVerticalPlacement(rect, position);
        break;
    }
    return position;
  }, [tooltipPlacement]);
  
  if (!run) return null;
  
  return (
    <WalkthroughPortal>
      <div className="bk bk-walkthrough" aria-hidden={!run}>
        {/* Spotlight */}
        {isInViewport && rect && currentStep && (
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
          <Tooltip
            className={cl["bk-walkthrough-tooltip"]}
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
            aria-describedby="walkthrough-description"
            arrow={tooltipPlacement}
            style={{
              ...getTooltipPosition(rect, spotlightPadding),
              ...currentStep.styles,
            }}
          > 
            {renderProps ? renderProps(currentStep) : (
              <>
                <div className={cl["bk-walkthrough-tooltip-header"]}>
                  <h5 id="walkthrough-title">{currentStep.title}</h5>
                  <Icon
                    role="button"
                    icon="cross"
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
                    <Button onClick={handleNextStep}>
                      {activeStep < steps.length - 1 ? "Next" : "Finish"}
                    </Button>
                  </div>
                </div>
              </>
            )}
            </Tooltip>
        )}

        {/* Overlay background */}
        <div className={cl["bk-walkthrough-overlay"]} />
      </div>
    </WalkthroughPortal>
  );
};

export { WalkThrough, type Step, type CallbackProps };
