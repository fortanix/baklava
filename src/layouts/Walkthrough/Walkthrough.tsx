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
  description?: string | React.ReactElement;
  /** Preferred placement of tooltip relative to target element */
  placement: Placement;
  /** Padding around the highlighted element in pixels (default: 10) */
  spotlightPadding?: number;
  /** Whether to disable the dark overlay backdrop */
  disableOverlay?: boolean;
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
  /**
   * CSS selector for a custom scrollable container that wraps the target element.
   * If specified, scrolling will be applied to this container instead of the window.
   * Useful for elements inside modals or scrollable panels.
   * 
   * Example: '.modal-body' or '#scroll-container'
   */
  scrollableParent?: string;
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
      threshold: 0.9, // Callback triggers only when 90% or more of the entire element is visible.
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
 * @param offsetLeft - Optional horizontal offset to fine-tune tooltip position
 * @returns Updated position styles with vertical adjustments
 */
const getTooltipVerticalPlacement = (rect: DOMRect, position: React.CSSProperties, offsetTop: number) => {
  const newPos: { [key: string]: React.CSSProperties } = {};

  if (rect.top < 100) {
    // Near top of viewport - align tooltip to top
    newPos.top = 0 + offsetTop;
  } else if (rect.top > (window.innerHeight - 100)) {
    // Near bottom of viewport - position above element
    newPos.top = rect.top + offsetTop;
    newPos.transform = `translateY(-50%)`;
  } else {
    // Enough space - center tooltip vertically on element
    newPos.top = rect.top + (rect.height / 2) + offsetTop;
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
 * @param offsetTop - Optional vertical offset to fine-tune tooltip position
 * @returns Updated position styles with horizontal adjustments
 */
const getTooltipHorizontalPlacement = (rect: DOMRect, position: React.CSSProperties, offsetLeft: number) => {
  const newPos: { [key: string]: React.CSSProperties } = {};

  if (rect.left < 180) {
    // Near left edge - align tooltip to left
    newPos.left = 0 + offsetLeft;
  } else if (rect.left > (window.innerWidth - 372)) {
    // Near right edge - align tooltip to right with padding
    newPos.left = window.innerWidth - 360 - 12 + offsetLeft;
  } else {
    // Enough space - center tooltip horizontally on element
    newPos.left = rect.left + (rect.width / 2) + offsetLeft;
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

/**
 * Clamps the bounding rectangle of an element to the visible viewport.
 *
 * This function adjusts the DOMRect of an element to ensure its dimensions
 * do not extend beyond the bounds of the current browser viewport.
 * It is useful when an element is partially off-screen, and you want to
 * calculate tooltip placement or visibility based only on the visible portion.
 *
 * @param rect - The original DOMRect of the target element (from getBoundingClientRect).
 * @returns A modified DOMRect-like object that is constrained to the visible viewport.
 *
 * @example
 * const rect = element.getBoundingClientRect();
 * const visibleRect = getCustomRectInViewport(rect);
 * // Use visibleRect to position tooltips or overlays within view
 */
function getCustomRectInViewport(rect: DOMRect): DOMRect {
  const top = Math.max(1, rect.top);
  const left = Math.max(1, rect.left);
  const bottom = Math.min(window.innerHeight, rect.bottom);
  const right = Math.min(window.innerWidth, rect.right);
  const width = right - left;
  const height = bottom - top;

  // Return as a new DOMRect-like object
  return {
    top,
    left,
    bottom,
    right,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({ top, left, bottom, right, width, height }),
  };
}

/** Interactive Walkthrough Component */
const WalkThrough = (props: WalkThroughProps) => {
  const {
    steps,
    run,
    stepIndex = 0,
    callback,
    renderProps,
  } = props
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
  const scrollableParentElement = currentStep?.scrollableParent ? document.querySelector(currentStep.scrollableParent) as HTMLElement : null;
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

    enableScrollLock();
    const scrollAndMeasure = async () => {
      const rect = await waitForScrollIntoView(targetElement as HTMLElement, scrollableParentElement as HTMLElement);
      const inViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;

      // if (!inViewport) {
      //Walkthrough guide target bounds partially outside viewport
      // }
      const customRect = inViewport ? rect : getCustomRectInViewport(rect);
      setIsInViewport(true);

      if (customRect) {
        setRect(customRect);
      } else {
        disableScrollLock();
      }
    };

    scrollAndMeasure();
  }, [targetElement, scrollableParentElement, run, targetReady, enableScrollLock, disableScrollLock]);

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

  /**
   * Determines the optimal tooltip placement relative to the target element,
   * ensuring that the tooltip remains within the visible viewport.
   *
   * Uses the preferred placement provided in the current step, but gracefully
   * falls back to alternate positions (left, top, bottom) when there is insufficient
   * space in the initially requested direction.
   *
   * This logic considers the dimensions of the tooltip, spotlight padding, and
   * available space around the target element to prevent overflow.
   *
   * Priority order for fallbacks:
   * - If placement is 'right' but doesn't fit → try 'left' → then 'top' → then 'bottom'
   * - If placement is 'left' but doesn't fit → try 'right' → then 'top' → then 'bottom'
   * - If placement is 'top' but doesn't fit → try 'bottom' → then 'right' → then 'left'
   * - If placement is 'bottom' but doesn't fit → try 'top' → then 'right' → then 'left'
   *
   * @returns {Placement} - The best-fit tooltip placement: 'left', 'right', 'top', or 'bottom'
   */
  const tooltipPlacement: Placement = React.useMemo(() => {
    if (!currentStep || !rect) return "right";

    let placement = currentStep.placement;
    const tooltipBuffer = tooltipWidth + arrowSize + spotlightPadding;

    const fitsRight = rect.right + tooltipBuffer <= window.innerWidth;
    const fitsLeft = rect.left - tooltipBuffer >= 0;
    const fitsTop = rect.top - tooltipHeight >= 0;
    const fitsBottom = rect.bottom + tooltipHeight <= window.innerHeight;

    if (placement === 'right' && !fitsRight) {
      placement = fitsLeft ? 'left' : (fitsTop ? 'top' : 'bottom');
    } else if (placement === 'left' && !fitsLeft) {
      placement = fitsRight ? 'right' : (fitsTop ? 'top' : 'bottom');
    } else if (placement === 'top' && !fitsTop) {
      placement = fitsBottom ? 'bottom' : (fitsRight ? 'right' : 'left');
    } else if (placement === 'bottom' && !fitsBottom) {
      placement = fitsTop ? 'top' : (fitsRight ? 'right' : 'left');
    }

    return placement;
  }, [currentStep, rect, spotlightPadding]);

  /**
   * Determines the appropriate placement for the tooltip's arrow based on the
   * current tooltip placement relative to the target element.
   *
   * The arrow should point **toward** the target element, which is the **opposite**
   * direction of where the tooltip itself is positioned.
   *
   * Example:
   * - If the tooltip is placed to the 'right' of the target, the arrow should point 'left'.
   * - If the tooltip is above the target ('top'), the arrow should point 'bottom', and so on.
   *
   * This value is typically used for positioning the visual arrow element
   *
   * @returns {Placement | undefined} - Opposite direction of tooltipPlacement
   */
  const tooltipArrowPlacement = React.useMemo(() => {
    switch (tooltipPlacement) {
      case 'right': return 'left';
      case 'left': return 'right';
      case 'top': return 'bottom';
      case 'bottom': return 'top';
    }
  }, [tooltipPlacement]);


  /**
   * Calculates precise tooltip positioning based on target element and optimal placement
   * 
   * @param rect - Target element's bounding rectangle
   * @param pad - Spotlight padding value
   * @param offsetLeft - Optional horizontal offset to fine-tune tooltip position
   * @param offsetTop - Optional vertical offset to fine-tune tooltip position
   * @returns CSS positioning styles for the tooltip
   */
  const getTooltipPosition = React.useCallback((rect: DOMRect, pad: number, offsetLeft: number, offsetTop: number): React.CSSProperties => {
    let position: { [key: string]: React.CSSProperties } = {};
    // Calculate position based on optimal placement
    switch (tooltipPlacement) {
      case 'left':
        position.left = rect.left - (pad + arrowSize + tooltipWidth / 2) + offsetLeft;
        position.transform = 'translateX(-50%)';
        position = getTooltipVerticalPlacement(rect, position, offsetTop);
        break;

      case 'right':
        position.left = rect.left + rect.width + pad + arrowSize + offsetLeft;
        if (position.left as number > window.innerWidth) position.left = window.innerWidth / 2;
        position = getTooltipVerticalPlacement(rect, position, offsetTop);
        break;

      case 'top':
        position.top = rect.top - pad - arrowSize - tooltipHeight + offsetTop;
        position = getTooltipHorizontalPlacement(rect, position, offsetLeft);
        break;

      case 'bottom':
        position.top = rect.bottom + pad + arrowSize + offsetTop;
        position = getTooltipHorizontalPlacement(rect, position, offsetLeft);
        break;

      default:
        position.left = rect.left + rect.width + pad + arrowSize + offsetLeft;
        if (position.left as number > window.innerWidth) position.left = window.innerWidth / 2;
        position = getTooltipVerticalPlacement(rect, position, offsetTop);
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
        {!currentStep?.disableOverlay && <div className={cl["bk-walkthrough-overlay"]}>
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
        </div>}
        {/* Tooltip content - only render when target is in viewport */}
        {isInViewport && rect && currentStep && (
          <Tooltip
            className={cl["bk-walkthrough-tooltip"]}
            aria-modal="true"
            aria-labelledby="walkthrough-title"
            aria-describedby="walkthrough-description"
            arrow={tooltipArrowPlacement}
            style={{
              position: 'fixed',
              ...getTooltipPosition(rect, spotlightPadding, currentStep?.offsetLeft ?? 0, currentStep?.offsetTop ?? 0),
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
                    <Button onClick={handleNextStep} kind='primary'>
                      {activeStep < steps.length - 1 ? "Next" : "Finish"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Tooltip>
        )}
      </div>
    </WalkthroughPortal>
  );
};

export { WalkThrough, type Step, type CallbackProps, type WalkThroughProps };
