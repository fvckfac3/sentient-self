import { PrismaClient } from '@prisma/client'
import exerciseData from '../docs/exercises_database_final_634_clean.json'
import { seedFrameworks, generateFrameworkId } from './seed-frameworks'

const prisma = new PrismaClient()

// Short framework IDs used by some exercises in the JSON
const FRAMEWORK_ALIASES: Record<string, string> = {
  'future-self-visualization': 'future-self-visualization-back-casting',
  'values-alignment': 'values-clarification-alignment-check',
}

/** Exercises name their framework by ID or by display name; normalize to the ID */
function toFrameworkId(raw: string | undefined): string {
  const id = generateFrameworkId(raw || '')
  return FRAMEWORK_ALIASES[id] || id
}

/**
 * Seeds frameworks, then exercises. Safe to re-run: records are upserted,
 * never deleted (deleting an exercise cascades to users' completions).
 */
async function main() {
  console.log('🌱 Seeding database...')

  // Exercises reference frameworks, so those go first
  await seedFrameworks(prisma)

  const frameworkIds = new Set(
    (await prisma.framework.findMany({ select: { id: true } })).map(f => f.id)
  )

  const jsonData = exerciseData as { metadata: any; exercises: any[] }

  // The JSON mixes two shapes: { framework, aspect } and
  // { framework_used, specific_aspect }
  const exercises = jsonData.exercises.map((exercise: any) => ({
    id: exercise.id,
    title: exercise.title || 'Untitled Exercise',
    framework: toFrameworkId(exercise.framework || exercise.framework_used),
    topic: exercise.topic || null,
    aspect: exercise.aspect || exercise.specific_aspect || 'General',
    aiPrompt: exercise.ai_prompt || ''
  }))

  const unknown = exercises.filter(e => !frameworkIds.has(e.framework))
  if (unknown.length > 0) {
    throw new Error(
      `${unknown.length} exercises reference unknown frameworks: ` +
        Array.from(new Set(unknown.map(e => e.framework))).join(', ')
    )
  }

  console.log(`📚 Seeding ${exercises.length} exercises...`)
  console.log(`   Metadata version: ${jsonData.metadata.version}`)
  console.log(`   Last updated: ${jsonData.metadata.last_updated}`)

  for (const { id, ...data } of exercises) {
    await prisma.exercise.upsert({
      where: { id },
      update: data,
      create: { id, ...data }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   Total exercises seeded: ${exercises.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
