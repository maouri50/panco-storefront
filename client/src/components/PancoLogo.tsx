import React from "react";

type PancoLogoProps = {
  variant?: "light" | "dark";
  markOnly?: boolean;
};

export function PancoLogo({ variant = "dark", markOnly = false }: PancoLogoProps) {
  return (
    <span className={`panco-logo panco-logo--${variant}${markOnly ? " panco-logo--mark" : ""}`}>
      <svg className="panco-logo__mark" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20.5" />
        <path d="M18 34V14h8.1c4.8 0 8 2.5 8 6.4 0 3.8-3.2 6.4-8 6.4H20.8" />
      </svg>
      {!markOnly && <span className="panco-logo__type">Panco</span>}
    </span>
  );
}
