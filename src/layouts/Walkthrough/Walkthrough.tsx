import React from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../../components/actions/Button/Button';
import { Icon } from '../../components/graphics/Icon/Icon';
import { Tooltip } from '../../components/overlays/Tooltip/Tooltip';
import cl from './Walkthrough.module.scss';
import useScrollLock from '../../util/hooks/useScrollLock';

/** Status types for walkthrough actions and callbacks */
type Status = 'next' | 'prev' | 'skip' | 'finished';

/** Placement options for tooltip positioning relative to target element */
type Placement = 'left' | 'right' | 'top' | 'bottom';

/** Configuration for a single walkthrough step */
interface Step {
  /** CSS selector for the target element to highlight */
  target: string;
  /** Optional title displayed in the tooltip header */
  title?: string;
  /** Optional description/content displayed in the tooltip body */
  description?: string;
  /** Preferred placement of tooltip relative to target element */
  placement: Placement;
  /** Padding around the highlighted element in pixels (default: 10) */
  spotlightPadding?: number;
  /** Whether to disable the dark overlay backdrop */
  disableOverlay?: boolean;
  /** Whether to disable scroll locking during this step */
  disableScrolling?: boolean;
  /** Custom skip button configuration */
  customSkip?: { skip: React.ReactNode };
  /** Additional horizontal offset for fine-tuning tooltip position */
  offsetLeft?: number;
  /** Additional vertical offset for fine-tuning tooltip position */
  offsetTop?: number;
  /** Skip waiting for target element to exist in DOM (for dynamic content) */
  disableWait?: boolean;
  /** Custom inline styles applied to the tooltip container */
  styles?: React.CSSProperties;
  /** Custom inline styles applied to the spotlight highlight */
  spotlightStyles?: React.CSSProperties;
}

/**
 * Callback function parameters passed to parent component on walkthrough events
 * Provides comprehensive information about the current walkthrough state
 */
interface CallbackProps {
  /** The action that triggered this callback */
  action: Status;
  /** The step data for the target step (undefined when finished) */
  step: Step | undefined;
  /** Current step index (0-based) */
  index: number;
  /** Current walkthrough status (alias for action) */
  status: Status;
  /** Utility function to wait for DOM elements to become available */
  waitForTarget: (onReady: () => void, target?: string) => void;
}

/**
 * Props for the main WalkThrough component
 */
interface WalkThroughProps {
  /** Array of step configurations defining the walkthrough sequence */
  steps: Step[];
  /** Whether the walkthrough is currently active/visible */
  run: boolean;
  /** Starting step index (default: 0) */
  stepIndex?: number;
  /** Callback function invoked on walkthrough state changes */
  callback?: (args: CallbackProps) => void;
  /** Custom render function for tooltip content (overrides default UI) */
  renderProps?: (step: Step) => React.ReactNode;
}

// Tooltip configuration constants for consistent positioning
const arrowSize = 12;
const tooltipWidth = 360;
const tooltipHeight = 200;

/**
 * Waits for an element to scroll into view and stabilizes its position
 * 
 * @param element - The target HTML element to scroll to
 * @param scrollableParent - Optional scrollable container element
 * @returns Promise that resolves with the element's stable bounding rectangle
 */
const waitForScrollIntoView = (element: HTMLElement, scrollableParent?: HTMLElement): Promise<DOMRect> => {
  return new Promise((resolve) => {
    if (!element) return;

    // Determine which element should be scrolled
    if (scrollableParent) {
      scrollableParent?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    } else {
      element?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    }

    let frameCount = 0;
    let lastRect = element?.getBoundingClientRect();

    // Monitor position stability after scroll to prevent jitter
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

    // Use IntersectionObserver to detect when element becomes visible
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            // Wait additional frames for layout stabilization
            requestAnimationFrame(() => {
              checkStableRect();
            });
          });
        }
      }
    }, {
      root: null,
      threshold: 0.1,
    });

    observer.observe(element);
  });
};

/**
 * Calculates optimal vertical positioning for tooltip to prevent viewport overflow
 * Adjusts tooltip position based on target element's location relative to viewport edges
 * 
 * @param rect - Target element's bounding rectangle
 * @param position - Current tooltip position styles
 * @returns Updated position styles with vertical adjustments
 */
const getTooltipVerticalPlacement = (rect: DOMRect, position: React.CSSProperties) => {
  let newPos: React.CSSProperties = {};
  
  if (rect.top < 100) {
    // Near top of viewport - align tooltip to top
    newPos.top = 0;
  } else if (rect.top > (window.innerHeight - 100)) {
    // Near bottom of viewport - position above element
    newPos.top = rect.top;
    newPos.transform = `translateY(-50%)`;
  } else {
    // Enough space - center tooltip vertically on element
    newPos.top = rect.top + (rect.height / 2);
    newPos.transform = `translateY(-50%)`;
  }
  
  return { ...position, ...newPos };
};

/**
 * Calculates optimal horizontal positioning for tooltip to prevent viewport overflow
 * Adjusts tooltip position based on target element's location relative to viewport edges
 * 
 * @param rect - Target element's bounding rectangle  
 * @param position - Current tooltip position styles
 * @returns Updated position styles with horizontal adjustments
 */
const getTooltipHorizontalPlacement = (rect: DOMRect, position: React.CSSProperties) => {
  let newPos: React.CSSProperties = {};
  
  if (rect.left < 180) {
    // Near left edge - align tooltip to left
    newPos.left = 0;
  } else if (rect.left > (window.innerWidth - 372)) {
    // Near right edge - align tooltip to right with padding
    newPos.left = window.innerWidth - 360 - 12;
  } else {
    // Enough space - center tooltip horizontally on element
    newPos.left = rect.left + (rect.width / 2);
    newPos.transform = 'translateX(-50%)';
  }
  
  return { ...position, ...newPos };
};

/**
 * Portal component for rendering walkthrough UI outside the normal DOM hierarchy
 * @param children - React nodes to render in the portal
 */
const WalkthroughPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portal, setPortal] = React.useState<Element | null>(null);

  React.useEffect(() => {
    setPortal(document.body);
  }, []);

  if (!portal) return null;
  return createPortal(children, portal);
};

/** Interactive Walkthrough Component */
const WalkThrough: React.FC<WalkThroughProps> = ({
  steps,
  run,
  stepIndex = 0,
  callback,
  renderProps,
}) => {
  // Core state management
  const [isRun, setIsRun] = React.useState<boolean>(run);
  const [activeStep, setActiveStep] = React.useState(stepIndex);
  const [targetReady, setTargetReady] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [isInViewport, setIsInViewport] = React.useState(false);

  // Refs for cleanup and focus management
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);

  // Custom hook for scroll locking during walkthrough
  const { enableScrollLock, disableScrollLock } = useScrollLock(cl['bk-walkthrough-open']);

  // Current step data and derived values
  const currentStep = steps[activeStep];
  const targetElement = currentStep?.target ? document.querySelector(currentStep.target) as HTMLElement : null;
  const spotlightPadding = currentStep?.spotlightPadding || 10;

  /**
   * Validates that all required target elements exist in the DOM
   * 
   * @param steps - Array of walkthrough steps to validate
   * @param target - Optional specific target selector to check
   * @returns Boolean indicating whether all targets are available
   */
  const allTargetsExist = React.useCallback((steps: Step[], target?: string) => {
    if (target) return !!document.querySelector(target);
    return steps.every(step => step.disableWait || !!document.querySelector(step.target));
  }, []);

  /**
   * Waits for target elements to become available in the DOM
   * Uses MutationObserver to monitor DOM changes for dynamically added content
   * 
   * @param onReady - Callback function to execute when targets are ready
   * @param target - Optional specific target to wait for (defaults to all steps)
   */
  const waitForTarget = React.useCallback((onReady: () => void, target?: string) => {
    if (allTargetsExist(steps, target)) {
      onReady();
      return;
    }

    // Clean up any existing observer
    observerRef.current?.disconnect();
    
    // Create new observer to watch for DOM mutations
    observerRef.current = new MutationObserver(() => {
      if (allTargetsExist(steps, target)) {
        observerRef.current?.disconnect();
        onReady();
      }
    });

    // Start observing
    observerRef.current.observe(document.body, { childList: true, subtree: true });
  }, [allTargetsExist, steps]);

  // Wait for target elements to be ready in DOM
  React.useEffect(() => {
    if (!run || !currentStep) return;

    setTargetReady(false);

    waitForTarget(() => {
      setTargetReady(true);
    }, currentStep.target);
  }, [run, currentStep, waitForTarget]);

  // Scroll to target element and measure its position
  React.useEffect(() => {
    if (!targetElement || !run || !targetReady) return;

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

  // Manage scroll locking and focus preservation
  React.useEffect(() => {
    if (run) {
      // Store currently focused element for restoration later
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      enableScrollLock();
    } else {
      disableScrollLock();
    }

    // Cleanup function to ensure scroll is unlocked
    return disableScrollLock;
  }, [run, enableScrollLock, disableScrollLock]);

  // Handle keyboard navigation
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

  // Restore focus to previously focused element on unmount
  React.useEffect(() => {
    return () => previouslyFocusedElement.current?.focus();
  }, []);

  /** Handles navigation to the previous step */
  const handlePrevStep = React.useCallback(() => {
    setRect(null);
    if (callback) {
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

  /** Handles navigation to the next step or completion */
  const handleNextStep = React.useCallback(() => {
    setRect(null);
    const isFinal = activeStep >= steps.length - 1;
    
    if (callback) {
      callback({
        action: isFinal ? 'finished' : 'next',
        step: steps[activeStep + 1] ?? steps[activeStep],
        index: activeStep,
        status: isFinal ? 'finished' : 'next',
        waitForTarget,
      });
    }
    
    if (isFinal) {
      setIsRun(false);
    } else {
      setActiveStep(prev => prev + 1);
    }
  }, [callback, steps, activeStep, waitForTarget]);

  /** Handles skipping/canceling the entire walkthrough */
  const handleSkip = React.useCallback(() => {
    if (callback) {
      callback({
        action: 'skip',
        step: steps[activeStep],
        index: activeStep,
        status: 'skip',
        waitForTarget,
      });
    }
    setIsRun(false);
  }, [callback, steps, activeStep, waitForTarget]);

  /** Determines optimal placement that keeps tooltip within viewport bounds */
  const tooltipPlacement: Placement = React.useMemo(() => {
    if (!currentStep || !rect) return "right";
    
    let placement = currentStep?.placement;
    const tooltipWidthWithPadding = tooltipWidth + arrowSize + spotlightPadding;
    const screenWidth = window.innerWidth - tooltipWidthWithPadding;

    // Adjust horizontal placements based on available space
    if (placement === 'left' || placement === 'right') {
      if (placement === 'right' && rect.left < tooltipWidthWithPadding) {
        placement = "top";
      } else if ((rect.left + rect.width) > screenWidth) {
        placement = "top";
      }
    }
    // Adjust vertical placements based on available space  
    else if (placement === 'bottom' && rect.top < tooltipHeight) {
      placement = 'top';
    } else if (rect.top > (window.innerHeight - tooltipHeight)) {
      placement = 'bottom';
    }

    return placement;
  }, [currentStep, rect, spotlightPadding]);

  /**
   * Calculates precise tooltip positioning based on target element and optimal placement
   * 
   * @param rect - Target element's bounding rectangle
   * @param pad - Spotlight padding value
   * @returns CSS positioning styles for the tooltip
   */
  const getTooltipPosition = React.useCallback((rect: DOMRect, pad: number): React.CSSProperties => {
    let position: React.CSSProperties = {};
    
    // Calculate position based on optimal placement
    switch (tooltipPlacement) {
      case 'right':
        position.left = rect.left - arrowSize - pad;
        position.transform = 'translateX(-100%)';
        position = getTooltipVerticalPlacement(rect, position);
        break;
        
      case 'left':
        position.left = rect.left + rect.width + pad + arrowSize;
        if (position.left > window.innerWidth) position.left = window.innerWidth / 2;
        position = getTooltipVerticalPlacement(rect, position);
        break;
        
      case 'bottom':
        position.top = rect.top - pad - arrowSize - tooltipHeight;
        position = getTooltipHorizontalPlacement(rect, position);
        break;
        
      case 'top':
        position.top = rect.bottom + pad + arrowSize;
        position = getTooltipHorizontalPlacement(rect, position);
        break;
        
      default:
        position.left = rect.left + rect.width + pad + arrowSize;
        if (position.left > window.innerWidth) position.left = window.innerWidth / 2;
        position = getTooltipVerticalPlacement(rect, position);
        break;
    }
    
    return position;
  }, [tooltipPlacement]);

  // Don't render anything if walkthrough is not active
  if (!isRun) return null;

  return (
    <WalkthroughPortal>
      <div className="bk bk-walkthrough" aria-hidden={!isRun}>
        {/* Main overlay container */}
        <div className={cl["bk-walkthrough-overlay"]}>
          {/* Spotlight highlight around target element */}
          <div
            className={cl["bk-walkthrough-spotlight"]}
            style={{
              top: rect ? rect.top - spotlightPadding : 0,
              left: rect ? rect.left - spotlightPadding : 0,
              width: rect ? rect.width + 2 * spotlightPadding : 0,
              height: rect ? rect.height + 2 * spotlightPadding : 0,
              ...(currentStep && currentStep.spotlightStyles ? currentStep.spotlightStyles : {}),
            }}
          />

          {/* Tooltip content - only render when target is in viewport */}
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
                  {/* Tooltip header with title and close button */}
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
                  
                  {/* Tooltip content body */}
                  <div id="walkthrough-description" className={cl["bk-walkthrough-tooltip-content"]}>
                    {currentStep.description}
                  </div>
                  
                  {/* Tooltip footer with navigation controls */}
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
        </div>
      </div>
    </WalkthroughPortal>
  );
};

export { WalkThrough, type Step, type CallbackProps, type WalkThroughProps };
