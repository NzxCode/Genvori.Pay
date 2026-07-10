import { seedUsers } from './userSeed.js'
import { seedWallets } from './walletSeed.js'

async function runSeeders() {
  console.log('Running all seeders...')
  await seedUsers()
  await seedWallets()
  console.log('All seeders completed.')
}

runSeeders().catch(console.error)
