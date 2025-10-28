export const fmtBOB = (n) =>
  (Number(n)||0).toLocaleString('es-BO', { style:'currency', currency:'BOB', minimumFractionDigits:2 });

export const fmtInt = (n) =>
  (Number(n)||0).toLocaleString('es-BO');

export const fmtPct = (n) =>
  `${(Number(n)||0).toFixed(2)}%`;

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-BO') : '';
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-BO') : '';
