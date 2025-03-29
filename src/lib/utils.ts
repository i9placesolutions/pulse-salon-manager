
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useMemo } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função memorizada para formatação de moeda que pode ser reutilizada em componentes
export function useFormattedCurrency(value: number) {
  return useMemo(() => formatCurrency(value), [value])
}

// Função utilitária para verificar se dois arrays são iguais (para memorização)
export function areArraysEqual<T>(array1: T[], array2: T[], comparator?: (a: T, b: T) => boolean): boolean {
  if (array1 === array2) return true
  if (array1.length !== array2.length) return false

  return array1.every((item, index) => 
    comparator ? comparator(item, array2[index]) : item === array2[index]
  )
}

// Helper para funções debounce
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
}
