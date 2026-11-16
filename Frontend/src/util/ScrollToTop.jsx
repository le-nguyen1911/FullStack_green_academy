import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      gsap.killTweensOf(window);

      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: 0,
          autoKill: false,
        },
        ease: "power3.inOut",
        overwrite: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
