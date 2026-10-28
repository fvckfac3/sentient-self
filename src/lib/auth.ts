import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, LIMITS } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth - commented out until credentials are configured
    // Uncomment and add real credentials to use Google sign-in
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    
    // Apple provider requires proper key setup - commented out until configured
    // AppleProvider({
    //   clientId: process.env.APPLE_ID!,
    //   clientSecret: process.env.APPLE_SECRET!,
    // }),
    
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.trim().toLowerCase()

        // Throttle password guessing per account and per IP
        const forwarded = req?.headers?.['x-forwarded-for']
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || 'unknown'
        const [byEmail, byIp] = await Promise.all([
          rateLimit({ key: `login:email:${email}`, ...LIMITS.login }),
          rateLimit({ key: `login:ip:${ip}`, limit: LIMITS.login.limit * 3, windowMs: LIMITS.login.windowMs }),
        ])
        if (!byEmail.success || !byIp.success) {
          throw new Error('Too many sign-in attempts. Please wait 15 minutes and try again.')
        }

        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: 'insensitive' }
          },
          include: {
            baselineProfile: true
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string

        // Fetch full user data with profile
        const fullUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            baselineProfile: true
          }
        })

        if (fullUser) {
          session.user.subscriptionTier = fullUser.subscriptionTier
          session.user.onboardingDone = fullUser.onboardingDone
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
}