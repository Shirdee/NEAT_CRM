"use client";

import {useEffect} from "react";

export function AppShellBodyLock() {
  useEffect(() => {
    document.body.dataset.appShell = "locked";

    return () => {
      delete document.body.dataset.appShell;
    };
  }, []);

  return null;
}
