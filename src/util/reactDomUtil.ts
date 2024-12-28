
import { flushSync } from 'react-dom';


// Ref: https://malcolmkee.com/blog/view-transition-api-in-react-app
export const startViewTransition = (transition: () => void) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      flushSync(transition);
    });
  } else {
    transition();
  }
};
