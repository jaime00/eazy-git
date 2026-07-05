import getBranchType from '#getters/git/getBranchType.js'
import getTicketOfJIRA from '#getters/git/getTicketOfJIRA.js'

const createBranchName = async () => {
  const branchType = await getBranchType()
  const ticketOfJIRA = await getTicketOfJIRA()
  return `${branchType}/${ticketOfJIRA}`
}

export default createBranchName
