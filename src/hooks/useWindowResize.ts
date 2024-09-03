import { useEffect } from "react";

export default function useWindowResize(func: () => void): void {
  useEffect(() => {
    func();

    window.addEventListener("resize", func);
    return () => {
      window.removeEventListener("resize", func);
    };
  }, []);
}
