# Referral System Refactor - Backend Implementation Guide

## Overview

This document contains all backend-specific implementation instructions for refactoring the referral system from hardcoded constraints/rewards to a modular, extensible system.

**Key Changes:**
- Replace hardcoded campaign fields with reusable constraint/reward definitions
- Support multiple constraints and rewards per campaign
- Support "NONE" option for campaigns without constraints/rewards
- Protect system-defined types from deletion
- Enable easy extensibility without schema changes

---

## Table of Contents

1. [Prisma Schema Changes](#1-prisma-schema-changes)
2. [Database Migration](#2-database-migration)
3. [Seeder Implementation](#3-seeder-implementation)
4. [GraphQL Schema Updates](#4-graphql-schema-updates)
5. [GraphQL Resolvers](#5-graphql-resolvers)
6. [Service Logic Implementation](#6-service-logic-implementation)
7. [Migration Script](#7-migration-script)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. Prisma Schema Changes

### Location
`prisma/schema.prisma`

### New Models to Add

#### ConstraintDefinition Model

```prisma
model ConstraintDefinition {
  id          String   @id @default(cuid())
  type        String   @unique // MIN_WALLET_BALANCE, MIN_TRIP_COUNT, MAX_REFERRAL_COUNT, NONE
  label       String   // "Minimum Wallet Balance"
  description String?  // "Referee must have at least this amount in wallet"
  isSystem    Boolean  @default(false) // true for base types, false for custom
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  campaignConstraints CampaignConstraint[]

  @@index([type])
}
```

#### RewardDefinition Model

```prisma
model RewardDefinition {
  id          String   @id @default(cuid())
  type        String   @unique // FREE_RIDE, WALLET_CREDIT, DISCOUNT_PERCENTAGE, NONE
  label       String   // "Free Ride"
  description String?  // "Award a free ride to the user"
  isSystem    Boolean  @default(false) // true for base types
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  campaignRewards CampaignReward[]

  @@index([type])
}
```

#### AppliesTo Enum

```prisma
enum AppliesTo {
  REFERRER
  REFEREE
  BOTH
}
```

#### CampaignConstraint Model (Junction Table)

```prisma
model CampaignConstraint {
  id           String               @id @default(cuid())
  campaignId   String
  constraintId String
  appliesTo    AppliesTo            // REFERRER, REFEREE, BOTH
  value        Json?                // Store constraint value (e.g., { "minAmount": 500 })

  // Relations
  campaign    ReferralCampaign     @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  constraint  ConstraintDefinition @relation(fields: [constraintId], references: [id])

  @@unique([campaignId, constraintId, appliesTo])
  @@index([campaignId])
  @@index([constraintId])
}
```

#### CampaignReward Model (Junction Table)

```prisma
model CampaignReward {
  id         String           @id @default(cuid())
  campaignId String
  rewardId   String
  value      Json?            // Store reward value (e.g., { "amount": 50 } or { "percentage": 10 })

  // Relations
  campaign   ReferralCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  reward     RewardDefinition @relation(fields: [rewardId], references: [id])

  @@unique([campaignId, rewardId])
  @@index([campaignId])
  @@index([rewardId])
}
```

### Update Existing ReferralCampaign Model

**Remove these fields:**
```prisma
// REMOVE THESE
minWalletBalance     Decimal?
minTripCount         Int?
maxReferralCount     Int?
freeRideReward       Boolean  @default(false)
walletCreditReward   Decimal?
discountPercentage   Decimal?
```

**Add these relations:**
```prisma
// ADD THESE
constraints CampaignConstraint[]
rewards     CampaignReward[]
```

**Final ReferralCampaign Model:**
```prisma
model ReferralCampaign {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // NEW: Relations to modular constraints and rewards
  constraints CampaignConstraint[]
  rewards     CampaignReward[]

  // Existing relations
  referrals   Referral[]

  @@index([isActive])
  @@index([startDate, endDate])
}
```

---

## 2. Database Migration

### Run Migration

```bash
npx prisma migrate dev --name refactor_referral_system
```

**What this does:**
- Creates new `ConstraintDefinition`, `RewardDefinition`, `CampaignConstraint`, `CampaignReward` tables
- Creates `AppliesTo` enum
- Removes old columns from `ReferralCampaign` table
- Creates indexes for performance

**Important:** Do NOT run this migration until you've backed up existing campaigns, as the old fields will be dropped.

---

## 3. Seeder Implementation

### File Structure

Create these seeder files:
- `prisma/seeders/constraint-definitions.ts`
- `prisma/seeders/reward-definitions.ts`
- `prisma/seeders/index.ts` (update to run new seeders)

### Constraint Definitions Seeder

**File:** `prisma/seeders/constraint-definitions.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const BASE_CONSTRAINTS = [
  {
    type: 'NONE',
    label: 'No Constraint',
    description: 'No constraint applies',
    isSystem: true
  },
  {
    type: 'MIN_WALLET_BALANCE',
    label: 'Minimum Wallet Balance',
    description: 'User must have at least this amount in their wallet',
    isSystem: true
  },
  {
    type: 'MIN_TRIP_COUNT',
    label: 'Minimum Trip Count',
    description: 'User must have completed at least this many trips',
    isSystem: true
  },
  {
    type: 'MAX_REFERRAL_COUNT',
    label: 'Maximum Referral Count',
    description: 'User cannot exceed this number of referrals',
    isSystem: true
  }
];

export async function seedConstraintDefinitions() {
  console.log('Seeding constraint definitions...');

  for (const constraint of BASE_CONSTRAINTS) {
    await prisma.constraintDefinition.upsert({
      where: { type: constraint.type },
      update: {},
      create: constraint
    });
  }

  console.log(`✓ Seeded ${BASE_CONSTRAINTS.length} constraint definitions`);
}

export default seedConstraintDefinitions;
```

### Reward Definitions Seeder

**File:** `prisma/seeders/reward-definitions.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const BASE_REWARDS = [
  {
    type: 'NONE',
    label: 'No Reward',
    description: 'No reward is given',
    isSystem: true
  },
  {
    type: 'FREE_RIDE',
    label: 'Free Ride',
    description: 'Award a free ride to the user',
    isSystem: true
  },
  {
    type: 'WALLET_CREDIT',
    label: 'Wallet Credit',
    description: 'Add credit to user wallet',
    isSystem: true
  },
  {
    type: 'DISCOUNT_PERCENTAGE',
    label: 'Discount Percentage',
    description: 'Award a percentage discount on next ride',
    isSystem: true
  }
];

export async function seedRewardDefinitions() {
  console.log('Seeding reward definitions...');

  for (const reward of BASE_REWARDS) {
    await prisma.rewardDefinition.upsert({
      where: { type: reward.type },
      update: {},
      create: reward
    });
  }

  console.log(`✓ Seeded ${BASE_REWARDS.length} reward definitions`);
}

export default seedRewardDefinitions;
```

### Update Main Seeder

**File:** `prisma/seeders/index.ts`

```typescript
import { seedConstraintDefinitions } from './constraint-definitions';
import { seedRewardDefinitions } from './reward-definitions';

async function main() {
  // ... existing seeders ...

  // Add these new seeders
  await seedConstraintDefinitions();
  await seedRewardDefinitions();

  // ... rest of seeders ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Run Seeders

```bash
npx prisma db seed
```

---

## 4. GraphQL Schema Updates

### Location
`src/graphql/schema.graphql` (or wherever your schema is defined)

### New Types

```graphql
type ConstraintDefinition {
  id: ID!
  type: String!
  label: String!
  description: String
  isSystem: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RewardDefinition {
  id: ID!
  type: String!
  label: String!
  description: String
  isSystem: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum AppliesTo {
  REFERRER
  REFEREE
  BOTH
}

type CampaignConstraint {
  id: ID!
  constraint: ConstraintDefinition!
  appliesTo: AppliesTo!
  value: JSON
}

type CampaignReward {
  id: ID!
  reward: RewardDefinition!
  value: JSON
}
```

### Update ReferralCampaign Type

```graphql
type ReferralCampaign {
  id: ID!
  name: String!
  description: String
  isActive: Boolean!
  startDate: DateTime!
  endDate: DateTime

  # NEW: Replace old fields with these
  constraints: [CampaignConstraint!]!
  rewards: [CampaignReward!]!

  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Input Types

```graphql
input CampaignConstraintInput {
  constraintId: ID!
  appliesTo: AppliesTo!
  value: JSON
}

input CampaignRewardInput {
  rewardId: ID!
  value: JSON
}

input CreateReferralCampaignInput {
  name: String!
  description: String
  isActive: Boolean
  startDate: DateTime!
  endDate: DateTime
  constraints: [CampaignConstraintInput!]
  rewards: [CampaignRewardInput!]
}

input UpdateReferralCampaignInput {
  name: String
  description: String
  isActive: Boolean
  startDate: DateTime
  endDate: DateTime
  constraints: [CampaignConstraintInput!]
  rewards: [CampaignRewardInput!]
}
```

### Queries

```graphql
type Query {
  # Existing campaign queries
  referralCampaigns: [ReferralCampaign!]!
  referralCampaign(id: ID!): ReferralCampaign

  # NEW: Definition queries
  constraintDefinitions: [ConstraintDefinition!]!
  constraintDefinition(id: ID!): ConstraintDefinition
  rewardDefinitions: [RewardDefinition!]!
  rewardDefinition(id: ID!): RewardDefinition
}
```

### Mutations

```graphql
type Mutation {
  # Campaign mutations (UPDATE THESE)
  createReferralCampaign(input: CreateReferralCampaignInput!): ReferralCampaign!
  updateReferralCampaign(id: ID!, input: UpdateReferralCampaignInput!): ReferralCampaign!
  deleteReferralCampaign(id: ID!): Boolean!

  # NEW: Constraint definition mutations
  createConstraintDefinition(
    type: String!
    label: String!
    description: String
  ): ConstraintDefinition!

  updateConstraintDefinition(
    id: ID!
    label: String
    description: String
  ): ConstraintDefinition!

  deleteConstraintDefinition(id: ID!): Boolean!

  # NEW: Reward definition mutations
  createRewardDefinition(
    type: String!
    label: String!
    description: String
  ): RewardDefinition!

  updateRewardDefinition(
    id: ID!
    label: String
    description: String
  ): RewardDefinition!

  deleteRewardDefinition(id: ID!): Boolean!
}
```

---

## 5. GraphQL Resolvers

### File Structure

Create/update these resolver files:
- `src/modules/referral/resolvers/constraint-definition.resolver.ts`
- `src/modules/referral/resolvers/reward-definition.resolver.ts`
- `src/modules/referral/resolvers/referral-campaign.resolver.ts` (update existing)

### ConstraintDefinition Resolvers

**File:** `src/modules/referral/resolvers/constraint-definition.resolver.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const constraintDefinitionResolvers = {
  Query: {
    constraintDefinitions: async () => {
      return await prisma.constraintDefinition.findMany({
        orderBy: [
          { isSystem: 'desc' }, // System definitions first
          { label: 'asc' }
        ]
      });
    },

    constraintDefinition: async (_, { id }) => {
      return await prisma.constraintDefinition.findUnique({
        where: { id }
      });
    }
  },

  Mutation: {
    createConstraintDefinition: async (_, { type, label, description }) => {
      // Check if type already exists
      const existing = await prisma.constraintDefinition.findUnique({
        where: { type }
      });

      if (existing) {
        throw new Error(`Constraint type '${type}' already exists`);
      }

      return await prisma.constraintDefinition.create({
        data: {
          type,
          label,
          description,
          isSystem: false // Custom definitions are never system
        }
      });
    },

    updateConstraintDefinition: async (_, { id, label, description }) => {
      const constraint = await prisma.constraintDefinition.findUnique({
        where: { id }
      });

      if (!constraint) {
        throw new Error('Constraint definition not found');
      }

      // Only allow updating label and description
      return await prisma.constraintDefinition.update({
        where: { id },
        data: {
          ...(label && { label }),
          ...(description !== undefined && { description })
        }
      });
    },

    deleteConstraintDefinition: async (_, { id }) => {
      const constraint = await prisma.constraintDefinition.findUnique({
        where: { id }
      });

      if (!constraint) {
        throw new Error('Constraint definition not found');
      }

      if (constraint.isSystem) {
        throw new Error('Cannot delete system-defined constraint');
      }

      await prisma.constraintDefinition.delete({
        where: { id }
      });

      return true;
    }
  }
};
```

### RewardDefinition Resolvers

**File:** `src/modules/referral/resolvers/reward-definition.resolver.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const rewardDefinitionResolvers = {
  Query: {
    rewardDefinitions: async () => {
      return await prisma.rewardDefinition.findMany({
        orderBy: [
          { isSystem: 'desc' }, // System definitions first
          { label: 'asc' }
        ]
      });
    },

    rewardDefinition: async (_, { id }) => {
      return await prisma.rewardDefinition.findUnique({
        where: { id }
      });
    }
  },

  Mutation: {
    createRewardDefinition: async (_, { type, label, description }) => {
      // Check if type already exists
      const existing = await prisma.rewardDefinition.findUnique({
        where: { type }
      });

      if (existing) {
        throw new Error(`Reward type '${type}' already exists`);
      }

      return await prisma.rewardDefinition.create({
        data: {
          type,
          label,
          description,
          isSystem: false // Custom definitions are never system
        }
      });
    },

    updateRewardDefinition: async (_, { id, label, description }) => {
      const reward = await prisma.rewardDefinition.findUnique({
        where: { id }
      });

      if (!reward) {
        throw new Error('Reward definition not found');
      }

      // Only allow updating label and description
      return await prisma.rewardDefinition.update({
        where: { id },
        data: {
          ...(label && { label }),
          ...(description !== undefined && { description })
        }
      });
    },

    deleteRewardDefinition: async (_, { id }) => {
      const reward = await prisma.rewardDefinition.findUnique({
        where: { id }
      });

      if (!reward) {
        throw new Error('Reward definition not found');
      }

      if (reward.isSystem) {
        throw new Error('Cannot delete system-defined reward');
      }

      await prisma.rewardDefinition.delete({
        where: { id }
      });

      return true;
    }
  }
};
```

### ReferralCampaign Resolvers (Updated)

**File:** `src/modules/referral/resolvers/referral-campaign.resolver.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const referralCampaignResolvers = {
  Query: {
    referralCampaigns: async () => {
      return await prisma.referralCampaign.findMany({
        include: {
          constraints: {
            include: { constraint: true }
          },
          rewards: {
            include: { reward: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    referralCampaign: async (_, { id }) => {
      return await prisma.referralCampaign.findUnique({
        where: { id },
        include: {
          constraints: {
            include: { constraint: true }
          },
          rewards: {
            include: { reward: true }
          }
        }
      });
    }
  },

  Mutation: {
    createReferralCampaign: async (_, { input }) => {
      const { constraints, rewards, ...campaignData } = input;

      return await prisma.referralCampaign.create({
        data: {
          ...campaignData,
          constraints: {
            create: constraints?.map(c => ({
              constraintId: c.constraintId,
              appliesTo: c.appliesTo,
              value: c.value
            })) || []
          },
          rewards: {
            create: rewards?.map(r => ({
              rewardId: r.rewardId,
              value: r.value
            })) || []
          }
        },
        include: {
          constraints: {
            include: { constraint: true }
          },
          rewards: {
            include: { reward: true }
          }
        }
      });
    },

    updateReferralCampaign: async (_, { id, input }) => {
      const { constraints, rewards, ...campaignData } = input;

      return await prisma.referralCampaign.update({
        where: { id },
        data: {
          ...campaignData,
          ...(constraints && {
            constraints: {
              deleteMany: {}, // Remove all existing constraints
              create: constraints.map(c => ({
                constraintId: c.constraintId,
                appliesTo: c.appliesTo,
                value: c.value
              }))
            }
          }),
          ...(rewards && {
            rewards: {
              deleteMany: {}, // Remove all existing rewards
              create: rewards.map(r => ({
                rewardId: r.rewardId,
                value: r.value
              }))
            }
          })
        },
        include: {
          constraints: {
            include: { constraint: true }
          },
          rewards: {
            include: { reward: true }
          }
        }
      });
    },

    deleteReferralCampaign: async (_, { id }) => {
      await prisma.referralCampaign.delete({
        where: { id }
      });
      return true;
    }
  },

  ReferralCampaign: {
    constraints: async (parent) => {
      return await prisma.campaignConstraint.findMany({
        where: { campaignId: parent.id },
        include: { constraint: true }
      });
    },

    rewards: async (parent) => {
      return await prisma.campaignReward.findMany({
        where: { campaignId: parent.id },
        include: { reward: true }
      });
    }
  }
};
```

---

## 6. Service Logic Implementation

### Constraint Checking Service

**File:** `src/modules/referral/services/constraint-checker.service.ts`

```typescript
import { PrismaClient, AppliesTo } from '@prisma/client';

const prisma = new PrismaClient();

interface ConstraintCheckResult {
  valid: boolean;
  failedConstraint?: string;
}

export async function checkConstraints(
  userId: string,
  campaignId: string,
  appliesTo: 'REFERRER' | 'REFEREE'
): Promise<ConstraintCheckResult> {
  // Get all constraints that apply to this user type
  const constraints = await prisma.campaignConstraint.findMany({
    where: {
      campaignId,
      OR: [
        { appliesTo },
        { appliesTo: 'BOTH' }
      ]
    },
    include: { constraint: true }
  });

  // Check each constraint
  for (const c of constraints) {
    const { type } = c.constraint;

    // Skip NONE constraint
    if (type === 'NONE') continue;

    // Check MIN_WALLET_BALANCE
    if (type === 'MIN_WALLET_BALANCE') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true }
      });

      const minAmount = c.value?.minAmount || 0;

      if (!user || user.walletBalance < minAmount) {
        return {
          valid: false,
          failedConstraint: `Minimum wallet balance of ${minAmount} required`
        };
      }
    }

    // Check MIN_TRIP_COUNT
    if (type === 'MIN_TRIP_COUNT') {
      const tripCount = await prisma.order.count({
        where: {
          customerId: userId,
          status: 'COMPLETED'
        }
      });

      const minTrips = c.value?.minTrips || 0;

      if (tripCount < minTrips) {
        return {
          valid: false,
          failedConstraint: `Minimum ${minTrips} completed trips required`
        };
      }
    }

    // Check MAX_REFERRAL_COUNT
    if (type === 'MAX_REFERRAL_COUNT') {
      const referralCount = await prisma.referral.count({
        where: {
          referrerId: userId,
          campaignId
        }
      });

      const maxReferrals = c.value?.maxReferrals || Infinity;

      if (referralCount >= maxReferrals) {
        return {
          valid: false,
          failedConstraint: `Maximum ${maxReferrals} referrals reached`
        };
      }
    }

    // Add more constraint checks here as needed
  }

  return { valid: true };
}
```

### Reward Issuance Service

**File:** `src/modules/referral/services/reward-issuer.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function issueRewards(
  userId: string,
  campaignId: string
): Promise<void> {
  // Get all rewards for this campaign
  const rewards = await prisma.campaignReward.findMany({
    where: { campaignId },
    include: { reward: true }
  });

  // Issue each reward
  for (const r of rewards) {
    const { type } = r.reward;

    // Skip NONE reward
    if (type === 'NONE') continue;

    // Issue FREE_RIDE
    if (type === 'FREE_RIDE') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          freeRidesCount: { increment: 1 }
        }
      });
    }

    // Issue WALLET_CREDIT
    if (type === 'WALLET_CREDIT') {
      const amount = r.value?.amount || 0;

      await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: amount }
        }
      });
    }

    // Issue DISCOUNT_PERCENTAGE
    if (type === 'DISCOUNT_PERCENTAGE') {
      const percentage = r.value?.percentage || 0;

      // Create a discount coupon
      await prisma.discountCoupon.create({
        data: {
          userId,
          percentage,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
    }

    // Add more reward types here as needed
  }
}
```

### Update Referral Service

**File:** `src/modules/referral/services/referral.service.ts`

```typescript
import { checkConstraints } from './constraint-checker.service';
import { issueRewards } from './reward-issuer.service';

export async function createReferral(
  referrerId: string,
  refereeId: string,
  campaignId: string
) {
  // Check referrer constraints
  const referrerCheck = await checkConstraints(referrerId, campaignId, 'REFERRER');
  if (!referrerCheck.valid) {
    throw new Error(`Referrer constraint failed: ${referrerCheck.failedConstraint}`);
  }

  // Check referee constraints
  const refereeCheck = await checkConstraints(refereeId, campaignId, 'REFEREE');
  if (!refereeCheck.valid) {
    throw new Error(`Referee constraint failed: ${refereeCheck.failedConstraint}`);
  }

  // Create the referral
  const referral = await prisma.referral.create({
    data: {
      referrerId,
      refereeId,
      campaignId,
      status: 'ACTIVE'
    }
  });

  // Issue rewards to both users
  await issueRewards(referrerId, campaignId);
  await issueRewards(refereeId, campaignId);

  return referral;
}
```

---

## 7. Migration Script

### File
`scripts/migrate-referral-campaigns.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateReferralCampaigns() {
  console.log('Starting referral campaign migration...\n');

  // Get all existing campaigns
  const campaigns = await prisma.referralCampaign.findMany();
  console.log(`Found ${campaigns.length} campaigns to migrate\n`);

  // Get constraint/reward definitions
  const minWalletConstraint = await prisma.constraintDefinition.findUnique({
    where: { type: 'MIN_WALLET_BALANCE' }
  });
  const minTripConstraint = await prisma.constraintDefinition.findUnique({
    where: { type: 'MIN_TRIP_COUNT' }
  });
  const maxReferralConstraint = await prisma.constraintDefinition.findUnique({
    where: { type: 'MAX_REFERRAL_COUNT' }
  });
  const freeRideReward = await prisma.rewardDefinition.findUnique({
    where: { type: 'FREE_RIDE' }
  });
  const walletCreditReward = await prisma.rewardDefinition.findUnique({
    where: { type: 'WALLET_CREDIT' }
  });
  const discountReward = await prisma.rewardDefinition.findUnique({
    where: { type: 'DISCOUNT_PERCENTAGE' }
  });

  let migratedCount = 0;

  for (const campaign of campaigns) {
    console.log(`Migrating campaign: ${campaign.name} (${campaign.id})`);

    const constraints = [];
    const rewards = [];

    // Migrate constraints
    if (campaign.minWalletBalance && minWalletConstraint) {
      constraints.push({
        constraintId: minWalletConstraint.id,
        appliesTo: 'REFEREE',
        value: { minAmount: campaign.minWalletBalance.toNumber() }
      });
      console.log(`  - Added MIN_WALLET_BALANCE constraint: ${campaign.minWalletBalance}`);
    }

    if (campaign.minTripCount && minTripConstraint) {
      constraints.push({
        constraintId: minTripConstraint.id,
        appliesTo: 'REFEREE',
        value: { minTrips: campaign.minTripCount }
      });
      console.log(`  - Added MIN_TRIP_COUNT constraint: ${campaign.minTripCount}`);
    }

    if (campaign.maxReferralCount && maxReferralConstraint) {
      constraints.push({
        constraintId: maxReferralConstraint.id,
        appliesTo: 'REFERRER',
        value: { maxReferrals: campaign.maxReferralCount }
      });
      console.log(`  - Added MAX_REFERRAL_COUNT constraint: ${campaign.maxReferralCount}`);
    }

    // Migrate rewards
    if (campaign.freeRideReward && freeRideReward) {
      rewards.push({
        rewardId: freeRideReward.id,
        value: {}
      });
      console.log(`  - Added FREE_RIDE reward`);
    }

    if (campaign.walletCreditReward && walletCreditReward) {
      rewards.push({
        rewardId: walletCreditReward.id,
        value: { amount: campaign.walletCreditReward.toNumber() }
      });
      console.log(`  - Added WALLET_CREDIT reward: ${campaign.walletCreditReward}`);
    }

    if (campaign.discountPercentage && discountReward) {
      rewards.push({
        rewardId: discountReward.id,
        value: { percentage: campaign.discountPercentage.toNumber() }
      });
      console.log(`  - Added DISCOUNT_PERCENTAGE reward: ${campaign.discountPercentage}%`);
    }

    // Create new associations
    if (constraints.length > 0) {
      await prisma.campaignConstraint.createMany({
        data: constraints.map(c => ({
          ...c,
          campaignId: campaign.id
        })),
        skipDuplicates: true
      });
    }

    if (rewards.length > 0) {
      await prisma.campaignReward.createMany({
        data: rewards.map(r => ({
          ...r,
          campaignId: campaign.id
        })),
        skipDuplicates: true
      });
    }

    console.log(`  ✓ Migrated ${constraints.length} constraints and ${rewards.length} rewards\n`);
    migratedCount++;
  }

  console.log(`\n✓ Migration complete! Migrated ${migratedCount} campaigns.`);
}

migrateReferralCampaigns()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Run Migration

```bash
# 1. Backup database first!
# 2. Run Prisma migration
npx prisma migrate dev --name refactor_referral_system

# 3. Seed definitions
npx prisma db seed

# 4. Run migration script
npx ts-node scripts/migrate-referral-campaigns.ts
```

---

## 8. Testing Checklist

### Schema & Migration

- [ ] Prisma migration runs without errors
- [ ] All new models/tables are created
- [ ] Old columns are removed from ReferralCampaign
- [ ] Indexes are created correctly
- [ ] AppliesTo enum is created

### Seeders

- [ ] Constraint definitions seeder runs successfully
- [ ] 4 base constraints are created (NONE, MIN_WALLET_BALANCE, MIN_TRIP_COUNT, MAX_REFERRAL_COUNT)
- [ ] All constraint definitions have `isSystem: true`
- [ ] Reward definitions seeder runs successfully
- [ ] 4 base rewards are created (NONE, FREE_RIDE, WALLET_CREDIT, DISCOUNT_PERCENTAGE)
- [ ] All reward definitions have `isSystem: true`

### GraphQL Queries

- [ ] `constraintDefinitions` query returns all definitions
- [ ] `rewardDefinitions` query returns all definitions
- [ ] `referralCampaigns` query includes nested constraints and rewards
- [ ] `referralCampaign(id)` query returns campaign with nested data
- [ ] Queries return data in correct order (system first, then alphabetical)

### GraphQL Mutations - Constraint Definitions

- [ ] `createConstraintDefinition` creates custom definition with `isSystem: false`
- [ ] Cannot create duplicate type (unique constraint enforced)
- [ ] `updateConstraintDefinition` updates label and description
- [ ] `updateConstraintDefinition` does NOT allow updating type or isSystem
- [ ] `deleteConstraintDefinition` deletes custom definitions
- [ ] `deleteConstraintDefinition` throws error for system definitions

### GraphQL Mutations - Reward Definitions

- [ ] `createRewardDefinition` creates custom definition with `isSystem: false`
- [ ] Cannot create duplicate type (unique constraint enforced)
- [ ] `updateRewardDefinition` updates label and description
- [ ] `updateRewardDefinition` does NOT allow updating type or isSystem
- [ ] `deleteRewardDefinition` deletes custom definitions
- [ ] `deleteRewardDefinition` throws error for system definitions

### GraphQL Mutations - Campaigns

- [ ] `createReferralCampaign` creates campaign with constraints
- [ ] `createReferralCampaign` creates campaign with rewards
- [ ] `createReferralCampaign` creates campaign with both constraints and rewards
- [ ] `createReferralCampaign` works with empty constraints/rewards arrays
- [ ] `updateReferralCampaign` replaces constraints correctly
- [ ] `updateReferralCampaign` replaces rewards correctly
- [ ] `deleteReferralCampaign` cascade deletes campaign constraints and rewards

### Service Logic - Constraint Checking

- [ ] MIN_WALLET_BALANCE constraint enforced correctly
- [ ] MIN_TRIP_COUNT constraint enforced correctly
- [ ] MAX_REFERRAL_COUNT constraint enforced correctly
- [ ] NONE constraint is skipped
- [ ] Multiple constraints all validated
- [ ] REFERRER appliesTo works correctly
- [ ] REFEREE appliesTo works correctly
- [ ] BOTH appliesTo works for both referrer and referee
- [ ] Failed constraint returns appropriate error message

### Service Logic - Reward Issuance

- [ ] FREE_RIDE reward increments freeRidesCount
- [ ] WALLET_CREDIT reward adds to walletBalance
- [ ] DISCOUNT_PERCENTAGE reward creates discount coupon
- [ ] NONE reward is skipped
- [ ] Multiple rewards all issued correctly
- [ ] Reward values from JSON are used correctly

### Migration Script

- [ ] Old campaigns migrated successfully
- [ ] minWalletBalance → MIN_WALLET_BALANCE constraint
- [ ] minTripCount → MIN_TRIP_COUNT constraint
- [ ] maxReferralCount → MAX_REFERRAL_COUNT constraint
- [ ] freeRideReward → FREE_RIDE reward
- [ ] walletCreditReward → WALLET_CREDIT reward
- [ ] discountPercentage → DISCOUNT_PERCENTAGE reward
- [ ] appliesTo set correctly (REFERRER for max referrals, REFEREE for others)
- [ ] Constraint/reward values preserved correctly
- [ ] No duplicate entries created

### Integration Tests

- [ ] Create campaign via GraphQL mutation
- [ ] Create referral that meets all constraints
- [ ] Verify rewards issued to both referrer and referee
- [ ] Create referral that fails constraint
- [ ] Verify error message and no rewards issued
- [ ] Create custom constraint definition
- [ ] Use custom constraint in campaign
- [ ] Verify custom constraint enforced

---

## Implementation Order

1. **Prisma Schema** - Update schema.prisma
2. **Migration** - Run `prisma migrate dev`
3. **Seeders** - Create and run seeders
4. **GraphQL Schema** - Update schema definitions
5. **Resolvers** - Implement all resolvers
6. **Services** - Implement constraint checking and reward issuance
7. **Migration Script** - Create and test migration script
8. **Testing** - Run through complete testing checklist

---

## Notes

- **Backward Compatibility:** The migration script ensures existing campaigns are converted to the new structure
- **Extensibility:** New constraint/reward types can be added via admin panel without code changes (though service logic will need updating)
- **Performance:** Indexes on `campaignId` and `constraintId`/`rewardId` ensure fast lookups
- **Data Integrity:** Cascade deletes ensure orphaned records are cleaned up
- **System Protection:** `isSystem` flag prevents deletion of base constraint/reward types

---

## Support

For questions or issues during implementation, refer to:
- Main instruction document: `REFERRAL_REFACTOR_INSTRUCTIONS.md`
- Prisma documentation: https://www.prisma.io/docs
- GraphQL documentation: https://graphql.org/learn

---

**End of Backend Implementation Guide**
