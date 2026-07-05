const isEmpty = (value) => {
  return !value || typeof value !== 'string' || value?.trim()?.length === 0
}

export default isEmpty
