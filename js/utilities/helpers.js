// helpers.js - small utilities
export function el(q, root=document){ return root.querySelector(q); }
export function elAll(q, root=document){ return Array.from(root.querySelectorAll(q)); }
export function fmtNumber(n){ return typeof n==='number'? n.toLocaleString(): n }
export function uid(prefix='id'){ return prefix + Math.random().toString(36).slice(2,9); }
