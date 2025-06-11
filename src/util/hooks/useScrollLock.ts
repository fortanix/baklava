import React from "react";

const body = document.documentElement;
const useScrollLock = (className: string) => {
    const enableScrollLock = React.useCallback(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.classList.add(className);
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }
    }, []);

    const disableScrollLock = React.useCallback(() => {
        body.classList.remove(className);
        body.style.paddingRight = '';
    },[]);

  return {enableScrollLock, disableScrollLock};
};

export default useScrollLock;
