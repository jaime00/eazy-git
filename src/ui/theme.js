import chalk from 'chalk'

export const colors = {
  primary: '#57d7c4',
  secondary: '#199288',
  muted: '#9ca3af',
  success: '#06D6A0',
  error: '#EF4444',
  warning: '#F59E0B'
}

export const ui = {
  primary: (text) => chalk.hex(colors.primary)(text),
  secondary: (text) => chalk.hex(colors.secondary)(text),
  muted: (text) => chalk.hex(colors.muted)(text),
  success: (text) => chalk.hex(colors.success)(text),
  error: (text) => chalk.hex(colors.error)(text),
  warning: (text) => chalk.hex(colors.warning)(text)
}
