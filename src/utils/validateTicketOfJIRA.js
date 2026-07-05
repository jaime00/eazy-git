const validateTicketOfJIRA = (ticket) => {
  const regex = /^[A-Z]{3}-\d{4}$/
  return regex.test(ticket)
}

export default validateTicketOfJIRA
