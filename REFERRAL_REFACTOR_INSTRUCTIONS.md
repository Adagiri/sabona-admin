# Referral System Refactor - Comprehensive Instructions

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [Campaign Model Changes](#campaign-model-changes)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [GraphQL Schema Updates](#graphql-schema-updates)
6. [Service Logic Guidance](#service-logic-guidance)
7. [Seeder Data](#seeder-data)
8. [Admin Panel Mockups](#admin-panel-mockups)
9. [Migration Script](#migration-script)
10. [Testing Checklist](#testing-checklist)

---

## 1. Architecture Overview

### Current System (Hardcoded)
Currently, each campaign has hardcoded fields for constraints and rewards:
- `minWalletBalance`, `minTripCount`, `maxReferralCount`
- `freeRideReward`, `walletCreditReward`, `discountPercentage`

**Problems:**
- Not extensible - adding new constraint types requires schema changes
- Cannot support multiple constraints/rewards per campaign
- Cannot support "NONE" constraint or reward
- Difficult to maintain and test

### New System (Modular & Reusable)

Constraints and rewards become **reusable definitions** that campaigns can reference:

```
ConstraintDefinition (e.g., MIN_WALLET_BALANCE)
       ↓
Campaign references multiple constraints
       ↓
Applied to REFERRER | REFEREE | BOTH
```

```
RewardDefinition (e.g., FREE_RIDE, WALLET_CREDIT)
       ↓
Campaign references multiple rewards
       ↓
Each reward has its own configuration
```

**Benefits:**
- Support for NONE (no constraint/reward)
- Multiple constraints per campaign (e.g., min wallet + min trips)
- Multiple rewards per campaign (e.g., free ride + wallet credit)
- Easy to add new types via admin panel (no code changes)
- System-defined types protected from deletion

---

## 2. Data Models

### ConstraintDefinition Model

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

### RewardDefinition Model

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

### CampaignConstraint Model (Junction Table)

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

enum AppliesTo {
  REFERRER
  REFEREE
  BOTH
}
```

### CampaignReward Model (Junction Table)

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

---

## 3. Campaign Model Changes

### Updated ReferralCampaign Model

**Remove these fields:**
```prisma
// OLD - Remove these
minWalletBalance     Decimal?
minTripCount         Int?
maxReferralCount     Int?
freeRideReward       Boolean  @default(false)
walletCreditReward   Decimal?
discountPercentage   Decimal?
```

**Add these relations:**
```prisma
// NEW - Add these relations
constraints CampaignConstraint[]
rewards     CampaignReward[]
```

**Final ReferralCampaign model:**
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

## 4. Step-by-Step Implementation

### Step 1: Update Prisma Schema
1. Add `ConstraintDefinition`, `RewardDefinition`, `CampaignConstraint`, `CampaignReward` models
2. Add `AppliesTo` enum
3. Update `ReferralCampaign` model (remove old fields, add new relations)
4. Run `npx prisma migrate dev --name refactor_referral_system`

### Step 2: Create Seeders
Create seeder files to populate base constraint and reward definitions:

**`seeders/constraint-definitions.ts`:**
```typescript
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
```

**`seeders/reward-definitions.ts`:**
```typescript
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
```

### Step 3: Update GraphQL Schema

**Add new types:**
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

type ReferralCampaign {
  id: ID!
  name: String!
  description: String
  isActive: Boolean!
  startDate: DateTime!
  endDate: DateTime
  constraints: [CampaignConstraint!]!
  rewards: [CampaignReward!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

**Add input types:**
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

**Add queries:**
```graphql
type Query {
  # Existing
  referralCampaigns: [ReferralCampaign!]!
  referralCampaign(id: ID!): ReferralCampaign

  # NEW
  constraintDefinitions: [ConstraintDefinition!]!
  rewardDefinitions: [RewardDefinition!]!
}
```

**Add mutations:**
```graphql
type Mutation {
  # Campaign mutations
  createReferralCampaign(input: CreateReferralCampaignInput!): ReferralCampaign!
  updateReferralCampaign(id: ID!, input: UpdateReferralCampaignInput!): ReferralCampaign!
  deleteReferralCampaign(id: ID!): Boolean!

  # NEW: Constraint definition mutations
  createConstraintDefinition(type: String!, label: String!, description: String): ConstraintDefinition!
  updateConstraintDefinition(id: ID!, label: String, description: String): ConstraintDefinition!
  deleteConstraintDefinition(id: ID!): Boolean!

  # NEW: Reward definition mutations
  createRewardDefinition(type: String!, label: String!, description: String): RewardDefinition!
  updateRewardDefinition(id: ID!, label: String, description: String): RewardDefinition!
  deleteRewardDefinition(id: ID!): Boolean!
}
```

### Step 4: Update Resolvers

**ConstraintDefinition Resolvers:**
```typescript
// Query resolvers
constraintDefinitions: async () => {
  return await prisma.constraintDefinition.findMany({
    orderBy: [{ isSystem: 'desc' }, { label: 'asc' }]
  });
}

// Mutation resolvers
createConstraintDefinition: async (_, { type, label, description }) => {
  return await prisma.constraintDefinition.create({
    data: { type, label, description, isSystem: false }
  });
}

updateConstraintDefinition: async (_, { id, label, description }) => {
  return await prisma.constraintDefinition.update({
    where: { id },
    data: { label, description }
  });
}

deleteConstraintDefinition: async (_, { id }) => {
  const constraint = await prisma.constraintDefinition.findUnique({ where: { id } });
  if (constraint?.isSystem) {
    throw new Error('Cannot delete system-defined constraint');
  }
  await prisma.constraintDefinition.delete({ where: { id } });
  return true;
}
```

**RewardDefinition Resolvers:**
```typescript
// Query resolvers
rewardDefinitions: async () => {
  return await prisma.rewardDefinition.findMany({
    orderBy: [{ isSystem: 'desc' }, { label: 'asc' }]
  });
}

// Mutation resolvers
createRewardDefinition: async (_, { type, label, description }) => {
  return await prisma.rewardDefinition.create({
    data: { type, label, description, isSystem: false }
  });
}

updateRewardDefinition: async (_, { id, label, description }) => {
  return await prisma.rewardDefinition.update({
    where: { id },
    data: { label, description }
  });
}

deleteRewardDefinition: async (_, { id }) => {
  const reward = await prisma.rewardDefinition.findUnique({ where: { id } });
  if (reward?.isSystem) {
    throw new Error('Cannot delete system-defined reward');
  }
  await prisma.rewardDefinition.delete({ where: { id } });
  return true;
}
```

**ReferralCampaign Resolvers:**
```typescript
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
      constraints: { include: { constraint: true } },
      rewards: { include: { reward: true } }
    }
  });
}

updateReferralCampaign: async (_, { id, input }) => {
  const { constraints, rewards, ...campaignData } = input;

  return await prisma.referralCampaign.update({
    where: { id },
    data: {
      ...campaignData,
      ...(constraints && {
        constraints: {
          deleteMany: {},
          create: constraints.map(c => ({
            constraintId: c.constraintId,
            appliesTo: c.appliesTo,
            value: c.value
          }))
        }
      }),
      ...(rewards && {
        rewards: {
          deleteMany: {},
          create: rewards.map(r => ({
            rewardId: r.rewardId,
            value: r.value
          }))
        }
      })
    },
    include: {
      constraints: { include: { constraint: true } },
      rewards: { include: { reward: true } }
    }
  });
}
```

### Step 5: Update Service Logic

**Constraint Checking Service:**
```typescript
async function checkConstraints(
  userId: string,
  campaignId: string,
  appliesTo: 'REFERRER' | 'REFEREE'
): Promise<{ valid: boolean; failedConstraint?: string }> {
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

  for (const c of constraints) {
    const { type } = c.constraint;

    if (type === 'NONE') continue;

    if (type === 'MIN_WALLET_BALANCE') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const minAmount = c.value?.minAmount || 0;
      if (user.walletBalance < minAmount) {
        return { valid: false, failedConstraint: `Minimum wallet balance of ${minAmount} required` };
      }
    }

    if (type === 'MIN_TRIP_COUNT') {
      const tripCount = await prisma.order.count({
        where: { customerId: userId, status: 'COMPLETED' }
      });
      const minTrips = c.value?.minTrips || 0;
      if (tripCount < minTrips) {
        return { valid: false, failedConstraint: `Minimum ${minTrips} trips required` };
      }
    }

    if (type === 'MAX_REFERRAL_COUNT') {
      const referralCount = await prisma.referral.count({
        where: { referrerId: userId, campaignId }
      });
      const maxReferrals = c.value?.maxReferrals || Infinity;
      if (referralCount >= maxReferrals) {
        return { valid: false, failedConstraint: `Maximum ${maxReferrals} referrals reached` };
      }
    }
  }

  return { valid: true };
}
```

**Reward Issuance Service:**
```typescript
async function issueRewards(
  userId: string,
  campaignId: string
): Promise<void> {
  const rewards = await prisma.campaignReward.findMany({
    where: { campaignId },
    include: { reward: true }
  });

  for (const r of rewards) {
    const { type } = r.reward;

    if (type === 'NONE') continue;

    if (type === 'FREE_RIDE') {
      await prisma.user.update({
        where: { id: userId },
        data: { freeRidesCount: { increment: 1 } }
      });
    }

    if (type === 'WALLET_CREDIT') {
      const amount = r.value?.amount || 0;
      await prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } }
      });
    }

    if (type === 'DISCOUNT_PERCENTAGE') {
      const percentage = r.value?.percentage || 0;
      // Create a discount coupon or apply to next ride
      await prisma.discountCoupon.create({
        data: {
          userId,
          percentage,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
    }
  }
}
```

### Step 6: Create Migration Script

**`scripts/migrate-referral-campaigns.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateReferralCampaigns() {
  console.log('Starting referral campaign migration...');

  // Get all existing campaigns
  const campaigns = await prisma.referralCampaign.findMany();

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

  for (const campaign of campaigns) {
    console.log(`Migrating campaign: ${campaign.name}`);

    const constraints = [];
    const rewards = [];

    // Migrate constraints
    if (campaign.minWalletBalance && minWalletConstraint) {
      constraints.push({
        constraintId: minWalletConstraint.id,
        appliesTo: 'REFEREE',
        value: { minAmount: campaign.minWalletBalance }
      });
    }

    if (campaign.minTripCount && minTripConstraint) {
      constraints.push({
        constraintId: minTripConstraint.id,
        appliesTo: 'REFEREE',
        value: { minTrips: campaign.minTripCount }
      });
    }

    if (campaign.maxReferralCount && maxReferralConstraint) {
      constraints.push({
        constraintId: maxReferralConstraint.id,
        appliesTo: 'REFERRER',
        value: { maxReferrals: campaign.maxReferralCount }
      });
    }

    // Migrate rewards
    if (campaign.freeRideReward && freeRideReward) {
      rewards.push({
        rewardId: freeRideReward.id,
        value: {}
      });
    }

    if (campaign.walletCreditReward && walletCreditReward) {
      rewards.push({
        rewardId: walletCreditReward.id,
        value: { amount: campaign.walletCreditReward }
      });
    }

    if (campaign.discountPercentage && discountReward) {
      rewards.push({
        rewardId: discountReward.id,
        value: { percentage: campaign.discountPercentage }
      });
    }

    // Create new associations
    if (constraints.length > 0) {
      await prisma.campaignConstraint.createMany({
        data: constraints.map(c => ({
          ...c,
          campaignId: campaign.id
        }))
      });
    }

    if (rewards.length > 0) {
      await prisma.campaignReward.createMany({
        data: rewards.map(r => ({
          ...r,
          campaignId: campaign.id
        }))
      });
    }

    console.log(`Migrated ${constraints.length} constraints and ${rewards.length} rewards`);
  }

  console.log('Migration complete!');
}

migrateReferralCampaigns()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 7: Update Admin Panel

See [Admin Panel Mockups](#admin-panel-mockups) section below for detailed UI implementation.

---

## 5. GraphQL Schema Updates

See [Step 3](#step-3-update-graphql-schema) above for complete schema changes.

---

## 6. Service Logic Guidance

### Constraint Checking Flow

1. When a referral is created, check constraints:
   ```typescript
   const referrerCheck = await checkConstraints(referrerId, campaignId, 'REFERRER');
   const refereeCheck = await checkConstraints(refereeId, campaignId, 'REFEREE');

   if (!referrerCheck.valid) {
     throw new Error(referrerCheck.failedConstraint);
   }
   if (!refereeCheck.valid) {
     throw new Error(refereeCheck.failedConstraint);
   }
   ```

2. If all constraints pass, create the referral

3. Issue rewards:
   ```typescript
   await issueRewards(referrerId, campaignId);
   await issueRewards(refereeId, campaignId);
   ```

### Extensibility

To add a new constraint type:
1. Admin creates a new `ConstraintDefinition` via admin panel
2. Developer adds constraint checking logic in the service
3. No database migration needed!

To add a new reward type:
1. Admin creates a new `RewardDefinition` via admin panel
2. Developer adds reward issuance logic in the service
3. No database migration needed!

---

## 7. Seeder Data

### Base Constraint Definitions

```typescript
const BASE_CONSTRAINTS = [
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
```

### Base Reward Definitions

```typescript
const BASE_REWARDS = [
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
```

---

## 8. Admin Panel Mockups

### Campaign Create/Edit Form

```
┌─────────────────────────────────────────────────────────┐
│ Create Referral Campaign                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Campaign Name: [________________________]                │
│ Description:   [________________________]                │
│                                                          │
│ Start Date:    [DD/MM/YYYY]  End Date: [DD/MM/YYYY]     │
│ Active:        [✓] Yes  [ ] No                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ CONSTRAINTS                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Constraint 1                              [Remove]│    │
│ │                                                   │    │
│ │ Type:      [▼ Minimum Wallet Balance]            │    │
│ │ Applies To: [▼ Referee]                           │    │
│ │ Value:     [500] (minimum amount)                │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Constraint 2                              [Remove]│    │
│ │                                                   │    │
│ │ Type:      [▼ Minimum Trip Count]                │    │
│ │ Applies To: [▼ Referee]                           │    │
│ │ Value:     [5] (minimum trips)                   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Constraint]                                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ REWARDS                                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Reward 1                                  [Remove]│    │
│ │                                                   │    │
│ │ Type:  [▼ Free Ride]                              │    │
│ │ Value: N/A                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Reward 2                                  [Remove]│    │
│ │                                                   │    │
│ │ Type:  [▼ Wallet Credit]                          │    │
│ │ Value: [50] (credit amount)                      │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Reward]                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              [Cancel]  [Save Campaign]                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Constraint/Reward Definition Management

```
┌─────────────────────────────────────────────────────────┐
│ Manage Constraint Definitions                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [+ Create New Constraint Definition]                    │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Type                 │ Label              │ Actions │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ NONE (System)        │ No Constraint      │ [View] │ │
│ │ MIN_WALLET_BALANCE   │ Min Wallet Balance │ [View] │ │
│ │ MIN_TRIP_COUNT       │ Min Trip Count     │ [View] │ │
│ │ MAX_REFERRAL_COUNT   │ Max Referrals      │ [View] │ │
│ │ CUSTOM_AGE_CHECK     │ Age Verification   │ [Edit] │Delete] │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Note: System-defined constraints cannot be deleted      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Campaign List View

```
┌─────────────────────────────────────────────────────────┐
│ Referral Campaigns                   [+ Create Campaign]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Campaign Name  │ Status │ Constraints │ Rewards │   │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Summer Promo   │ Active │ 2           │ 2       │[Edit][Delete]│ │
│ │ New User Bonus │ Active │ 1           │ 1       │[Edit][Delete]│ │
│ │ Holiday Special│ Ended  │ 3           │ 1       │[Edit][Delete]│ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Migration Script

See [Step 6](#step-6-create-migration-script) for the complete migration script.

**Run migration:**
```bash
npx ts-node scripts/migrate-referral-campaigns.ts
```

**Important:** Run the migration AFTER:
1. Running the Prisma migration
2. Seeding the base constraint and reward definitions

---

## 10. Testing Checklist

### Backend Testing

- [ ] **Schema Migration**
  - [ ] Prisma migration runs without errors
  - [ ] All new models are created
  - [ ] Existing data is preserved

- [ ] **Seeders**
  - [ ] Constraint definitions are seeded correctly
  - [ ] Reward definitions are seeded correctly
  - [ ] System definitions have `isSystem: true`

- [ ] **GraphQL Queries**
  - [ ] `constraintDefinitions` returns all definitions
  - [ ] `rewardDefinitions` returns all definitions
  - [ ] `referralCampaigns` includes nested constraints and rewards

- [ ] **GraphQL Mutations**
  - [ ] Create campaign with multiple constraints/rewards
  - [ ] Update campaign and replace constraints/rewards
  - [ ] Delete campaign (cascade deletes campaign constraints/rewards)
  - [ ] Create custom constraint definition
  - [ ] Cannot delete system-defined definitions

- [ ] **Service Logic**
  - [ ] Constraint checking works for all constraint types
  - [ ] Multiple constraints are all validated
  - [ ] Reward issuance works for all reward types
  - [ ] Multiple rewards are all issued

- [ ] **Migration Script**
  - [ ] Old campaigns are migrated correctly
  - [ ] Constraint values are preserved
  - [ ] Reward values are preserved
  - [ ] `appliesTo` is set correctly (REFERRER/REFEREE)

### Admin Panel Testing

- [ ] **Campaign Management**
  - [ ] Can create campaign with constraints/rewards
  - [ ] Can add multiple constraints with "Add Constraint" button
  - [ ] Can remove constraints with "Remove" button
  - [ ] Can add multiple rewards with "Add Reward" button
  - [ ] Can remove rewards with "Remove" button
  - [ ] Constraint/reward dropdowns populated from definitions
  - [ ] Value fields show/hide based on selected type

- [ ] **Definition Management**
  - [ ] Can view all constraint definitions
  - [ ] Can create custom constraint definition
  - [ ] Can edit custom definition
  - [ ] Cannot delete system definitions
  - [ ] Can delete custom definitions
  - [ ] Same tests for reward definitions

- [ ] **UI/UX**
  - [ ] Form validation works
  - [ ] Error messages display correctly
  - [ ] Success messages on save
  - [ ] Loading states during API calls

### Integration Testing

- [ ] Create a campaign via admin panel
- [ ] Submit a referral that meets constraints
- [ ] Verify rewards are issued
- [ ] Submit a referral that fails constraints
- [ ] Verify error message and no rewards issued
- [ ] Create custom constraint/reward definition
- [ ] Use custom definition in a campaign
- [ ] Verify it works end-to-end

---

## Summary

This refactor transforms the referral system from hardcoded constraints/rewards to a flexible, modular system that:

1. **Supports extensibility** - Add new types without schema changes
2. **Supports multiple constraints/rewards** - No limit to campaign complexity
3. **Supports "NONE" option** - Campaigns can have no constraints or no rewards
4. **Protects system definitions** - Base types cannot be deleted
5. **Easy to manage** - Admin panel for all CRUD operations
6. **Backward compatible** - Migration script handles existing data

**Next Steps:**
1. Review and approve this plan
2. Implement backend changes (Steps 1-6)
3. Implement admin panel changes (Step 7)
4. Run migration script
5. Test thoroughly using the checklist
6. Deploy to production

---

**Questions or clarifications needed? Please reach out!**
