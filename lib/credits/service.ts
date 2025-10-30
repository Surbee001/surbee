type Id = string

const DEFAULT_FREE_CREDITS = 100

const memory = new Map<Id, number>()

export async function getCredits(userId: Id): Promise<number> {
  if (!memory.has(userId)) memory.set(userId, DEFAULT_FREE_CREDITS)
  return memory.get(userId) as number
}

export async function consumeCredits(userId: Id, amount: number) {
  const current = await getCredits(userId)
  if (current < amount) throw new Error('Insufficient credits')
  memory.set(userId, current - amount)
  return memory.get(userId) as number
}

