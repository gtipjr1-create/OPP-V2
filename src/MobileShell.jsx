import { useLayoutEffect, useRef, useState } from "react";
import BottomNav from "./BottomNav";

const SHELL_Z = {
  content: 1,
  header: 20,
  nav: 30,
};

export default function MobileShell({
  header,
  children,
  currentNav,
  onNavigate,
  contentPaddingInline = "var(--mobile-page-gutter)",
}) {
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(84);
  const [navHeight, setNavHeight] = useState(70);

  useLayoutEffect(() => {
    function measure() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight || 84);
      }
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight || 70);
      }
    }

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });

    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (navRef.current) resizeObserver.observe(navRef.current);

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        height: "100dvh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        className="screen-reveal"
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <div
          ref={headerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: SHELL_Z.header,
            paddingTop: "env(safe-area-inset-top)",
            background: "#000",
            borderBottom: "1px solid #121212",
            boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          {header}
        </div>

        <div
          className="mobile-shell-scroll"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: headerHeight,
            bottom: navHeight,
            zIndex: SHELL_Z.content,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            paddingInline: contentPaddingInline,
            paddingTop: 0,
            paddingBottom: 12,
          }}
        >
          {children}
        </div>

        <div
          ref={navRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: SHELL_Z.nav,
            paddingBottom: "env(safe-area-inset-bottom)",
            background: "#000",
          }}
        >
          <BottomNav current={currentNav} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
