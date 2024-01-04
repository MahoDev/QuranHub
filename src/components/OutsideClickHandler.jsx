import React, { useEffect, useRef } from "react";

function OutsideClickHandler({
  children,
  excludedSelectors = [],
  onOutsideClick,
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const isClickInsideExcludedElement = excludedSelectors.some(
        (selector) =>
          event.target.matches(selector) ||
          event.target.closest(selector) !== null
      );
      if (wrapperRef.current && !isClickInsideExcludedElement) {
        onOutsideClick();
      }
    };

    document.body.addEventListener("click", handleOutsideClick);

    return () => {
      document.body.removeEventListener("click", handleOutsideClick);
    };
  }, [onOutsideClick]);

  return <div ref={wrapperRef}>{children}</div>;
}

export default OutsideClickHandler;
