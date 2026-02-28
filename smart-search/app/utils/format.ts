export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return 'N/D'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number | undefined | null): string {
  if (n == null) return 'N/D'
  return new Intl.NumberFormat('it-IT').format(n)
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/D'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
