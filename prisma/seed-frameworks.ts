import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

/**
 * Generate a URL-friendly ID from framework name
 */
function generateFrameworkId(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, '') // Remove "The" prefix
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

async function seedFrameworks() {
  try {
    // Read frameworks JSON file
    const frameworksPath = path.join(__dirname, '../docs/frameworks_final_13_edited.json')
    
    if (!fs.existsSync(frameworksPath)) {
      console.error(`❌ File not found: ${frameworksPath}`)
      process.exit(1)
    }

    const frameworksFile = fs.readFileSync(frameworksPath, 'utf-8')
    const frameworksData = JSON.parse(frameworksFile)

    if (!frameworksData.frameworks || !Array.isArray(frameworksData.frameworks)) {
      console.error('❌ Invalid frameworks data structure')
      process.exit(1)
    }

    console.log(`\n🌱 Seeding ${frameworksData.frameworks.length} frameworks...\n`)

    let seededCount = 0
    let updatedCount = 0

    for (const framework of frameworksData.frameworks) {
      const frameworkId = generateFrameworkId(framework.framework_name)

      // Check if framework already exists
      const existing = await prisma.framework.findUnique({
        where: { id: frameworkId }
      })

      const frameworkRecord = await prisma.framework.upsert({
        where: { id: frameworkId },
        update: {
          name: framework.framework_name,
          coreMechanism: framework.core_mechanism,
          description: framework.description,
          therapeuticBasis: framework.therapeutic_basis,
          phases: framework.phases,
          deliverables: framework.final_deliverables,
          bestSuitedFor: framework.best_suited_for,
        },
        create: {
          id: frameworkId,
          name: framework.framework_name,
          coreMechanism: framework.core_mechanism,
          description: framework.description,
          therapeuticBasis: framework.therapeutic_basis,
          phases: framework.phases,
          deliverables: framework.final_deliverables,
          bestSuitedFor: framework.best_suited_for,
        },
      })

      if (existing) {
        console.log(`   ✓ Updated: ${framework.framework_name} (${frameworkId})`)
        updatedCount++
      } else {
        console.log(`   ✓ Created: ${framework.framework_name} (${frameworkId})`)
        seededCount++
      }
    }

    console.log(`\n✅ Framework seeding complete!`)
    console.log(`   - Created: ${seededCount}`)
    console.log(`   - Updated: ${updatedCount}`)
    console.log(`   - Total: ${frameworksData.frameworks.length}\n`)

    // Show framework IDs that will be used
    console.log('📋 Framework IDs generated:')
    frameworksData.frameworks.forEach((fw: any) => {
      const id = generateFrameworkId(fw.framework_name)
      console.log(`   - ${fw.framework_name} → ${id}`)
    })

  } catch (error) {
    console.error('❌ Error seeding frameworks:', error)
    throw error
  }
}

seedFrameworks()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
