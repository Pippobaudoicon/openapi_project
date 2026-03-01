type ColorMode = 'dark' | 'light'

export function useTheme() {
  const colorMode = useState<ColorMode>('color-mode', () => 'dark')

  function apply() {
    if (!import.meta.client) return
    const isDark = colorMode.value === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }

  function toggle() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    apply()
    if (import.meta.client) {
      localStorage.setItem('smart-search-theme', colorMode.value)
    }
  }

  function init() {
    if (!import.meta.client) return
    const stored = localStorage.getItem('smart-search-theme') as ColorMode | null
    colorMode.value = stored || 'dark'
    apply()
  }

  const isDark = computed(() => colorMode.value === 'dark')

  return { colorMode: readonly(colorMode), isDark, toggle, init }
}
