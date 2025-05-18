const body = document.documentElement;
const useScrollLock = (className: string) => {
    const enableScrollLock = () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.classList.add(className);
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }
    }

    const disableScrollLock = () => {
        body.classList.remove(className);
        body.style.paddingRight = '';
    }

  return {enableScrollLock, disableScrollLock}
};

export default useScrollLock;
