# Referral System Refactor - Admin Panel Implementation Guide

## Overview

This document contains all admin panel-specific implementation instructions for the referral system refactor. The admin panel needs to support creating/editing campaigns with modular constraints and rewards, as well as managing constraint and reward definitions.

**Key Features to Implement:**
- Campaign management with dynamic constraint/reward selection
- Support for multiple constraints and rewards per campaign
- Constraint/Reward definition management
- Protection of system-defined types
- Intuitive UI with Add/Remove buttons for constraints/rewards
- Dynamic value fields based on selected constraint/reward type

---

## Table of Contents

1. [GraphQL Client Setup](#1-graphql-client-setup)
2. [Type Definitions](#2-type-definitions)
3. [GraphQL Queries & Mutations](#3-graphql-queries--mutations)
4. [Component Structure](#4-component-structure)
5. [Campaign Management UI](#5-campaign-management-ui)
6. [Definition Management UI](#6-definition-management-ui)
7. [Form Validation](#7-form-validation)
8. [UI Mockups & Wireframes](#8-ui-mockups--wireframes)
9. [Testing Checklist](#9-testing-checklist)

---

## 1. GraphQL Client Setup

### Required Dependencies

Ensure you have these packages installed:

```bash
npm install @apollo/client graphql
# or
yarn add @apollo/client graphql
```

### Apollo Client Configuration

If not already configured, set up Apollo Client:

**File:** `src/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include'
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});
```

---

## 2. Type Definitions

### TypeScript Interfaces

**File:** `src/types/referral.types.ts`

```typescript
export enum AppliesTo {
  REFERRER = 'REFERRER',
  REFEREE = 'REFEREE',
  BOTH = 'BOTH'
}

export interface ConstraintDefinition {
  id: string;
  type: string;
  label: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardDefinition {
  id: string;
  type: string;
  label: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignConstraint {
  id: string;
  constraint: ConstraintDefinition;
  appliesTo: AppliesTo;
  value?: {
    minAmount?: number;
    minTrips?: number;
    maxReferrals?: number;
    [key: string]: any;
  };
}

export interface CampaignReward {
  id: string;
  reward: RewardDefinition;
  value?: {
    amount?: number;
    percentage?: number;
    [key: string]: any;
  };
}

export interface ReferralCampaign {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  constraints: CampaignConstraint[];
  rewards: CampaignReward[];
  createdAt: string;
  updatedAt: string;
}

// Form input types
export interface CampaignConstraintInput {
  constraintId: string;
  appliesTo: AppliesTo;
  value?: any;
}

export interface CampaignRewardInput {
  rewardId: string;
  value?: any;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  constraints: CampaignConstraintInput[];
  rewards: CampaignRewardInput[];
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  constraints?: CampaignConstraintInput[];
  rewards?: CampaignRewardInput[];
}
```

---

## 3. GraphQL Queries & Mutations

### Queries

**File:** `src/graphql/queries/referral.queries.ts`

```typescript
import { gql } from '@apollo/client';

export const GET_REFERRAL_CAMPAIGNS = gql`
  query GetReferralCampaigns {
    referralCampaigns {
      id
      name
      description
      isActive
      startDate
      endDate
      constraints {
        id
        appliesTo
        value
        constraint {
          id
          type
          label
          description
          isSystem
        }
      }
      rewards {
        id
        value
        reward {
          id
          type
          label
          description
          isSystem
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_REFERRAL_CAMPAIGN = gql`
  query GetReferralCampaign($id: ID!) {
    referralCampaign(id: $id) {
      id
      name
      description
      isActive
      startDate
      endDate
      constraints {
        id
        appliesTo
        value
        constraint {
          id
          type
          label
          description
          isSystem
        }
      }
      rewards {
        id
        value
        reward {
          id
          type
          label
          description
          isSystem
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONSTRAINT_DEFINITIONS = gql`
  query GetConstraintDefinitions {
    constraintDefinitions {
      id
      type
      label
      description
      isSystem
      createdAt
      updatedAt
    }
  }
`;

export const GET_REWARD_DEFINITIONS = gql`
  query GetRewardDefinitions {
    rewardDefinitions {
      id
      type
      label
      description
      isSystem
      createdAt
      updatedAt
    }
  }
`;
```

### Mutations

**File:** `src/graphql/mutations/referral.mutations.ts`

```typescript
import { gql } from '@apollo/client';

export const CREATE_REFERRAL_CAMPAIGN = gql`
  mutation CreateReferralCampaign($input: CreateReferralCampaignInput!) {
    createReferralCampaign(input: $input) {
      id
      name
      description
      isActive
      startDate
      endDate
      constraints {
        id
        appliesTo
        value
        constraint {
          id
          type
          label
        }
      }
      rewards {
        id
        value
        reward {
          id
          type
          label
        }
      }
    }
  }
`;

export const UPDATE_REFERRAL_CAMPAIGN = gql`
  mutation UpdateReferralCampaign($id: ID!, $input: UpdateReferralCampaignInput!) {
    updateReferralCampaign(id: $id, input: $input) {
      id
      name
      description
      isActive
      startDate
      endDate
      constraints {
        id
        appliesTo
        value
        constraint {
          id
          type
          label
        }
      }
      rewards {
        id
        value
        reward {
          id
          type
          label
        }
      }
    }
  }
`;

export const DELETE_REFERRAL_CAMPAIGN = gql`
  mutation DeleteReferralCampaign($id: ID!) {
    deleteReferralCampaign(id: $id)
  }
`;

export const CREATE_CONSTRAINT_DEFINITION = gql`
  mutation CreateConstraintDefinition(
    $type: String!
    $label: String!
    $description: String
  ) {
    createConstraintDefinition(type: $type, label: $label, description: $description) {
      id
      type
      label
      description
      isSystem
    }
  }
`;

export const UPDATE_CONSTRAINT_DEFINITION = gql`
  mutation UpdateConstraintDefinition(
    $id: ID!
    $label: String
    $description: String
  ) {
    updateConstraintDefinition(id: $id, label: $label, description: $description) {
      id
      type
      label
      description
      isSystem
    }
  }
`;

export const DELETE_CONSTRAINT_DEFINITION = gql`
  mutation DeleteConstraintDefinition($id: ID!) {
    deleteConstraintDefinition(id: $id)
  }
`;

export const CREATE_REWARD_DEFINITION = gql`
  mutation CreateRewardDefinition(
    $type: String!
    $label: String!
    $description: String
  ) {
    createRewardDefinition(type: $type, label: $label, description: $description) {
      id
      type
      label
      description
      isSystem
    }
  }
`;

export const UPDATE_REWARD_DEFINITION = gql`
  mutation UpdateRewardDefinition(
    $id: ID!
    $label: String
    $description: String
  ) {
    updateRewardDefinition(id: $id, label: $label, description: $description) {
      id
      type
      label
      description
      isSystem
    }
  }
`;

export const DELETE_REWARD_DEFINITION = gql`
  mutation DeleteRewardDefinition($id: ID!) {
    deleteRewardDefinition(id: $id)
  }
`;
```

---

## 4. Component Structure

### Recommended File Structure

```
src/
├── components/
│   └── referral/
│       ├── campaigns/
│       │   ├── CampaignList.tsx
│       │   ├── CampaignForm.tsx
│       │   ├── CampaignConstraintSection.tsx
│       │   ├── CampaignRewardSection.tsx
│       │   └── ConstraintValueInput.tsx
│       │   └── RewardValueInput.tsx
│       └── definitions/
│           ├── ConstraintDefinitionList.tsx
│           ├── ConstraintDefinitionForm.tsx
│           ├── RewardDefinitionList.tsx
│           └── RewardDefinitionForm.tsx
├── pages/
│   └── referral/
│       ├── campaigns/
│       │   ├── index.tsx (list)
│       │   ├── create.tsx
│       │   └── [id]/edit.tsx
│       └── definitions/
│           ├── constraints.tsx
│           └── rewards.tsx
├── graphql/
│   ├── queries/
│   │   └── referral.queries.ts
│   └── mutations/
│       └── referral.mutations.ts
└── types/
    └── referral.types.ts
```

---

## 5. Campaign Management UI

### CampaignList Component

**File:** `src/components/referral/campaigns/CampaignList.tsx`

```typescript
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_REFERRAL_CAMPAIGNS } from '@/graphql/queries/referral.queries';
import { DELETE_REFERRAL_CAMPAIGN } from '@/graphql/mutations/referral.mutations';
import { ReferralCampaign } from '@/types/referral.types';
import { Button, Table, Tag, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

export const CampaignList: React.FC = () => {
  const router = useRouter();
  const { data, loading, refetch } = useQuery(GET_REFERRAL_CAMPAIGNS);
  const [deleteCampaign] = useMutation(DELETE_REFERRAL_CAMPAIGN);

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign({ variables: { id } });
      message.success('Campaign deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete campaign');
    }
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Constraints',
      dataIndex: 'constraints',
      key: 'constraints',
      render: (constraints: any[]) => constraints.length
    },
    {
      title: 'Rewards',
      dataIndex: 'rewards',
      key: 'rewards',
      render: (rewards: any[]) => rewards.length
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ReferralCampaign) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/referral/campaigns/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this campaign?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Referral Campaigns</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/referral/campaigns/create')}
        >
          Create Campaign
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data?.referralCampaigns || []}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};
```

### CampaignForm Component

**File:** `src/components/referral/campaigns/CampaignForm.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Form, Input, DatePicker, Switch, Button, Card, Space, message } from 'antd';
import dayjs from 'dayjs';
import {
  GET_CONSTRAINT_DEFINITIONS,
  GET_REWARD_DEFINITIONS
} from '@/graphql/queries/referral.queries';
import {
  CREATE_REFERRAL_CAMPAIGN,
  UPDATE_REFERRAL_CAMPAIGN
} from '@/graphql/mutations/referral.mutations';
import { CampaignConstraintSection } from './CampaignConstraintSection';
import { CampaignRewardSection } from './CampaignRewardSection';
import {
  ReferralCampaign,
  CreateCampaignInput,
  CampaignConstraintInput,
  CampaignRewardInput
} from '@/types/referral.types';
import { useRouter } from 'next/router';

interface CampaignFormProps {
  campaign?: ReferralCampaign;
  isEdit?: boolean;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, isEdit = false }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  // State for dynamic constraints and rewards
  const [constraints, setConstraints] = useState<CampaignConstraintInput[]>([]);
  const [rewards, setRewards] = useState<CampaignRewardInput[]>([]);

  // Queries
  const { data: constraintDefs } = useQuery(GET_CONSTRAINT_DEFINITIONS);
  const { data: rewardDefs } = useQuery(GET_REWARD_DEFINITIONS);

  // Mutations
  const [createCampaign, { loading: creating }] = useMutation(CREATE_REFERRAL_CAMPAIGN);
  const [updateCampaign, { loading: updating }] = useMutation(UPDATE_REFERRAL_CAMPAIGN);

  // Load existing campaign data if editing
  useEffect(() => {
    if (campaign && isEdit) {
      form.setFieldsValue({
        name: campaign.name,
        description: campaign.description,
        isActive: campaign.isActive,
        startDate: dayjs(campaign.startDate),
        endDate: campaign.endDate ? dayjs(campaign.endDate) : null
      });

      setConstraints(
        campaign.constraints.map(c => ({
          constraintId: c.constraint.id,
          appliesTo: c.appliesTo,
          value: c.value
        }))
      );

      setRewards(
        campaign.rewards.map(r => ({
          rewardId: r.reward.id,
          value: r.value
        }))
      );
    }
  }, [campaign, isEdit, form]);

  const handleSubmit = async (values: any) => {
    try {
      const input: CreateCampaignInput = {
        name: values.name,
        description: values.description,
        isActive: values.isActive ?? true,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        constraints,
        rewards
      };

      if (isEdit && campaign) {
        await updateCampaign({
          variables: { id: campaign.id, input }
        });
        message.success('Campaign updated successfully');
      } else {
        await createCampaign({
          variables: { input }
        });
        message.success('Campaign created successfully');
      }

      router.push('/referral/campaigns');
    } catch (error) {
      message.error('Failed to save campaign');
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Card title="Campaign Details" style={{ marginBottom: 16 }}>
        <Form.Item
          label="Campaign Name"
          name="name"
          rules={[{ required: true, message: 'Please enter campaign name' }]}
        >
          <Input placeholder="e.g., Summer Referral Bonus" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Campaign description..." />
        </Form.Item>

        <Space size="large">
          <Form.Item label="Start Date" name="startDate" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item label="End Date" name="endDate">
            <DatePicker />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
      </Card>

      <CampaignConstraintSection
        constraints={constraints}
        setConstraints={setConstraints}
        constraintDefinitions={constraintDefs?.constraintDefinitions || []}
      />

      <CampaignRewardSection
        rewards={rewards}
        setRewards={setRewards}
        rewardDefinitions={rewardDefs?.rewardDefinitions || []}
      />

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={creating || updating}>
            {isEdit ? 'Update Campaign' : 'Create Campaign'}
          </Button>
          <Button onClick={() => router.push('/referral/campaigns')}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

### CampaignConstraintSection Component

**File:** `src/components/referral/campaigns/CampaignConstraintSection.tsx`

```typescript
import React from 'react';
import { Card, Button, Select, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { CampaignConstraintInput, ConstraintDefinition, AppliesTo } from '@/types/referral.types';
import { ConstraintValueInput } from './ConstraintValueInput';

const { Text } = Typography;

interface CampaignConstraintSectionProps {
  constraints: CampaignConstraintInput[];
  setConstraints: (constraints: CampaignConstraintInput[]) => void;
  constraintDefinitions: ConstraintDefinition[];
}

export const CampaignConstraintSection: React.FC<CampaignConstraintSectionProps> = ({
  constraints,
  setConstraints,
  constraintDefinitions
}) => {
  const addConstraint = () => {
    setConstraints([
      ...constraints,
      {
        constraintId: '',
        appliesTo: AppliesTo.REFEREE,
        value: {}
      }
    ]);
  };

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const updateConstraint = (index: number, updates: Partial<CampaignConstraintInput>) => {
    const updated = [...constraints];
    updated[index] = { ...updated[index], ...updates };
    setConstraints(updated);
  };

  const getConstraintType = (constraintId: string) => {
    const def = constraintDefinitions.find(c => c.id === constraintId);
    return def?.type || '';
  };

  return (
    <Card title="Constraints" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {constraints.map((constraint, index) => (
          <Card
            key={index}
            size="small"
            title={`Constraint ${index + 1}`}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeConstraint(index)}
              >
                Remove
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Type:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select constraint type"
                  value={constraint.constraintId || undefined}
                  onChange={(value) => updateConstraint(index, { constraintId: value })}
                >
                  {constraintDefinitions.map(def => (
                    <Select.Option key={def.id} value={def.id}>
                      {def.label}
                      {def.description && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          - {def.description}
                        </Text>
                      )}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Applies To:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={constraint.appliesTo}
                  onChange={(value) => updateConstraint(index, { appliesTo: value })}
                >
                  <Select.Option value={AppliesTo.REFERRER}>Referrer</Select.Option>
                  <Select.Option value={AppliesTo.REFEREE}>Referee</Select.Option>
                  <Select.Option value={AppliesTo.BOTH}>Both</Select.Option>
                </Select>
              </div>

              {constraint.constraintId && (
                <ConstraintValueInput
                  constraintType={getConstraintType(constraint.constraintId)}
                  value={constraint.value}
                  onChange={(value) => updateConstraint(index, { value })}
                />
              )}
            </Space>
          </Card>
        ))}

        <Button type="dashed" icon={<PlusOutlined />} onClick={addConstraint} block>
          Add Constraint
        </Button>
      </Space>
    </Card>
  );
};
```

### ConstraintValueInput Component

**File:** `src/components/referral/campaigns/ConstraintValueInput.tsx`

```typescript
import React from 'react';
import { InputNumber, Typography } from 'antd';

const { Text } = Typography;

interface ConstraintValueInputProps {
  constraintType: string;
  value: any;
  onChange: (value: any) => void;
}

export const ConstraintValueInput: React.FC<ConstraintValueInputProps> = ({
  constraintType,
  value,
  onChange
}) => {
  if (constraintType === 'NONE') {
    return <Text type="secondary">No value required</Text>;
  }

  if (constraintType === 'MIN_WALLET_BALANCE') {
    return (
      <div>
        <Text strong>Minimum Amount:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          placeholder="e.g., 500"
          min={0}
          value={value?.minAmount}
          onChange={(val) => onChange({ ...value, minAmount: val })}
        />
      </div>
    );
  }

  if (constraintType === 'MIN_TRIP_COUNT') {
    return (
      <div>
        <Text strong>Minimum Trips:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          placeholder="e.g., 5"
          min={0}
          value={value?.minTrips}
          onChange={(val) => onChange({ ...value, minTrips: val })}
        />
      </div>
    );
  }

  if (constraintType === 'MAX_REFERRAL_COUNT') {
    return (
      <div>
        <Text strong>Maximum Referrals:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          placeholder="e.g., 10"
          min={1}
          value={value?.maxReferrals}
          onChange={(val) => onChange({ ...value, maxReferrals: val })}
        />
      </div>
    );
  }

  // Default for custom constraint types
  return (
    <div>
      <Text strong>Value:</Text>
      <InputNumber
        style={{ width: '100%', marginTop: 8 }}
        placeholder="Enter value"
        value={value?.customValue}
        onChange={(val) => onChange({ ...value, customValue: val })}
      />
    </div>
  );
};
```

### CampaignRewardSection Component

**File:** `src/components/referral/campaigns/CampaignRewardSection.tsx`

```typescript
import React from 'react';
import { Card, Button, Select, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { CampaignRewardInput, RewardDefinition } from '@/types/referral.types';
import { RewardValueInput } from './RewardValueInput';

const { Text } = Typography;

interface CampaignRewardSectionProps {
  rewards: CampaignRewardInput[];
  setRewards: (rewards: CampaignRewardInput[]) => void;
  rewardDefinitions: RewardDefinition[];
}

export const CampaignRewardSection: React.FC<CampaignRewardSectionProps> = ({
  rewards,
  setRewards,
  rewardDefinitions
}) => {
  const addReward = () => {
    setRewards([
      ...rewards,
      {
        rewardId: '',
        value: {}
      }
    ]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, updates: Partial<CampaignRewardInput>) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], ...updates };
    setRewards(updated);
  };

  const getRewardType = (rewardId: string) => {
    const def = rewardDefinitions.find(r => r.id === rewardId);
    return def?.type || '';
  };

  return (
    <Card title="Rewards" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {rewards.map((reward, index) => (
          <Card
            key={index}
            size="small"
            title={`Reward ${index + 1}`}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeReward(index)}
              >
                Remove
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Type:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select reward type"
                  value={reward.rewardId || undefined}
                  onChange={(value) => updateReward(index, { rewardId: value })}
                >
                  {rewardDefinitions.map(def => (
                    <Select.Option key={def.id} value={def.id}>
                      {def.label}
                      {def.description && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          - {def.description}
                        </Text>
                      )}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {reward.rewardId && (
                <RewardValueInput
                  rewardType={getRewardType(reward.rewardId)}
                  value={reward.value}
                  onChange={(value) => updateReward(index, { value })}
                />
              )}
            </Space>
          </Card>
        ))}

        <Button type="dashed" icon={<PlusOutlined />} onClick={addReward} block>
          Add Reward
        </Button>
      </Space>
    </Card>
  );
};
```

### RewardValueInput Component

**File:** `src/components/referral/campaigns/RewardValueInput.tsx`

```typescript
import React from 'react';
import { InputNumber, Typography } from 'antd';

const { Text } = Typography;

interface RewardValueInputProps {
  rewardType: string;
  value: any;
  onChange: (value: any) => void;
}

export const RewardValueInput: React.FC<RewardValueInputProps> = ({
  rewardType,
  value,
  onChange
}) => {
  if (rewardType === 'NONE') {
    return <Text type="secondary">No value required</Text>;
  }

  if (rewardType === 'FREE_RIDE') {
    return <Text type="secondary">No value required (awards 1 free ride)</Text>;
  }

  if (rewardType === 'WALLET_CREDIT') {
    return (
      <div>
        <Text strong>Credit Amount:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          placeholder="e.g., 50"
          min={0}
          value={value?.amount}
          onChange={(val) => onChange({ ...value, amount: val })}
        />
      </div>
    );
  }

  if (rewardType === 'DISCOUNT_PERCENTAGE') {
    return (
      <div>
        <Text strong>Discount Percentage:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          placeholder="e.g., 10"
          min={0}
          max={100}
          value={value?.percentage}
          onChange={(val) => onChange({ ...value, percentage: val })}
          formatter={(val) => `${val}%`}
        />
      </div>
    );
  }

  // Default for custom reward types
  return (
    <div>
      <Text strong>Value:</Text>
      <InputNumber
        style={{ width: '100%', marginTop: 8 }}
        placeholder="Enter value"
        value={value?.customValue}
        onChange={(val) => onChange({ ...value, customValue: val })}
      />
    </div>
  );
};
```

---

## 6. Definition Management UI

### ConstraintDefinitionList Component

**File:** `src/components/referral/definitions/ConstraintDefinitionList.tsx`

```typescript
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONSTRAINT_DEFINITIONS } from '@/graphql/queries/referral.queries';
import { DELETE_CONSTRAINT_DEFINITION } from '@/graphql/mutations/referral.mutations';
import { ConstraintDefinition } from '@/types/referral.types';
import { Button, Table, Tag, Space, Popconfirm, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ConstraintDefinitionForm } from './ConstraintDefinitionForm';

export const ConstraintDefinitionList: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_CONSTRAINT_DEFINITIONS);
  const [deleteDefinition] = useMutation(DELETE_CONSTRAINT_DEFINITION);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<ConstraintDefinition | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDefinition({ variables: { id } });
      message.success('Constraint definition deleted successfully');
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete constraint definition');
    }
  };

  const handleEdit = (definition: ConstraintDefinition) => {
    setEditingDefinition(definition);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDefinition(null);
    refetch();
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: ConstraintDefinition) => (
        <Space>
          {type}
          {record.isSystem && <Tag color="blue">System</Tag>}
        </Space>
      )
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ConstraintDefinition) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          {!record.isSystem && (
            <Popconfirm
              title="Are you sure you want to delete this constraint definition?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger>
                Delete
              </Button>
            </Popconfirm>
          )}
          {record.isSystem && (
            <Button icon={<DeleteOutlined />} disabled>
              Delete
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Constraint Definitions</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Constraint Definition
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.constraintDefinitions || []}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingDefinition ? 'Edit Constraint Definition' : 'Create Constraint Definition'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <ConstraintDefinitionForm
          definition={editingDefinition || undefined}
          onSuccess={handleModalClose}
        />
      </Modal>
    </div>
  );
};
```

### ConstraintDefinitionForm Component

**File:** `src/components/referral/definitions/ConstraintDefinitionForm.tsx`

```typescript
import React from 'react';
import { useMutation } from '@apollo/client';
import { Form, Input, Button, Space, message } from 'antd';
import {
  CREATE_CONSTRAINT_DEFINITION,
  UPDATE_CONSTRAINT_DEFINITION
} from '@/graphql/mutations/referral.mutations';
import { ConstraintDefinition } from '@/types/referral.types';

interface ConstraintDefinitionFormProps {
  definition?: ConstraintDefinition;
  onSuccess: () => void;
}

export const ConstraintDefinitionForm: React.FC<ConstraintDefinitionFormProps> = ({
  definition,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const isEdit = !!definition;

  const [createDefinition, { loading: creating }] = useMutation(CREATE_CONSTRAINT_DEFINITION);
  const [updateDefinition, { loading: updating }] = useMutation(UPDATE_CONSTRAINT_DEFINITION);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateDefinition({
          variables: {
            id: definition.id,
            label: values.label,
            description: values.description
          }
        });
        message.success('Constraint definition updated successfully');
      } else {
        await createDefinition({
          variables: {
            type: values.type,
            label: values.label,
            description: values.description
          }
        });
        message.success('Constraint definition created successfully');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to save constraint definition');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={definition}
    >
      {!isEdit && (
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please enter type (e.g., CUSTOM_AGE_CHECK)' }]}
        >
          <Input placeholder="e.g., CUSTOM_AGE_CHECK" />
        </Form.Item>
      )}

      <Form.Item
        label="Label"
        name="label"
        rules={[{ required: true, message: 'Please enter label' }]}
      >
        <Input placeholder="e.g., Age Verification" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Description of this constraint..." />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={creating || updating}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button onClick={onSuccess}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

### Similar components for Reward Definitions

Create similar components for reward definitions:
- `RewardDefinitionList.tsx` (similar to ConstraintDefinitionList)
- `RewardDefinitionForm.tsx` (similar to ConstraintDefinitionForm)

---

## 7. Form Validation

### Validation Rules

**Campaign Form Validation:**

```typescript
const validateCampaign = (values: any, constraints: any[], rewards: any[]) => {
  const errors: string[] = [];

  // Basic validation
  if (!values.name) errors.push('Campaign name is required');
  if (!values.startDate) errors.push('Start date is required');

  // Constraint validation
  constraints.forEach((constraint, index) => {
    if (!constraint.constraintId) {
      errors.push(`Constraint ${index + 1}: Type is required`);
    }
    if (!constraint.appliesTo) {
      errors.push(`Constraint ${index + 1}: Applies To is required`);
    }

    // Type-specific validation
    const type = getConstraintType(constraint.constraintId);
    if (type === 'MIN_WALLET_BALANCE' && !constraint.value?.minAmount) {
      errors.push(`Constraint ${index + 1}: Minimum amount is required`);
    }
    if (type === 'MIN_TRIP_COUNT' && !constraint.value?.minTrips) {
      errors.push(`Constraint ${index + 1}: Minimum trips is required`);
    }
    if (type === 'MAX_REFERRAL_COUNT' && !constraint.value?.maxReferrals) {
      errors.push(`Constraint ${index + 1}: Maximum referrals is required`);
    }
  });

  // Reward validation
  rewards.forEach((reward, index) => {
    if (!reward.rewardId) {
      errors.push(`Reward ${index + 1}: Type is required`);
    }

    // Type-specific validation
    const type = getRewardType(reward.rewardId);
    if (type === 'WALLET_CREDIT' && !reward.value?.amount) {
      errors.push(`Reward ${index + 1}: Credit amount is required`);
    }
    if (type === 'DISCOUNT_PERCENTAGE' && !reward.value?.percentage) {
      errors.push(`Reward ${index + 1}: Discount percentage is required`);
    }
  });

  return errors;
};
```

---

## 8. UI Mockups & Wireframes

### Campaign List View

```
┌─────────────────────────────────────────────────────────────────┐
│ Referral Campaigns                       [+ Create Campaign]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Campaign Name │ Status │ Constraints │ Rewards │ Start Date ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Summer Promo  │ Active │      2      │    2    │ 2024-06-01 ││
│ │               │        │             │         │ [Edit][Del] ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ New User Bonus│ Active │      1      │    1    │ 2024-01-15 ││
│ │               │        │             │         │ [Edit][Del] ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ Holiday Promo │ Ended  │      3      │    1    │ 2023-12-01 ││
│ │               │        │             │         │ [Edit][Del] ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Campaign Create/Edit Form

```
┌───────────────────────────────────────────────────────────────────┐
│ Create Referral Campaign                                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ╔══════════════════════════════════════════════════════════════╗ │
│ ║ Campaign Details                                             ║ │
│ ╠══════════════════════════════════════════════════════════════╣ │
│ ║                                                              ║ │
│ ║ Campaign Name: [___________________________________]         ║ │
│ ║ Description:   [___________________________________]         ║ │
│ ║                [___________________________________]         ║ │
│ ║                                                              ║ │
│ ║ Start Date: [DD/MM/YYYY]  End Date: [DD/MM/YYYY]            ║ │
│ ║ Active:     [✓] Yes  [ ] No                                 ║ │
│ ╚══════════════════════════════════════════════════════════════╝ │
│                                                                    │
│ ╔══════════════════════════════════════════════════════════════╗ │
│ ║ CONSTRAINTS                                                  ║ │
│ ╠══════════════════════════════════════════════════════════════╣ │
│ ║                                                              ║ │
│ ║ ┌────────────────────────────────────────────────────────┐  ║ │
│ ║ │ Constraint 1                                  [Remove] │  ║ │
│ ║ │                                                        │  ║ │
│ ║ │ Type:      [▼ Minimum Wallet Balance]                 │  ║ │
│ ║ │ Applies To: [▼ Referee]                                │  ║ │
│ ║ │ Minimum Amount: [500___]                              │  ║ │
│ ║ └────────────────────────────────────────────────────────┘  ║ │
│ ║                                                              ║ │
│ ║ ┌────────────────────────────────────────────────────────┐  ║ │
│ ║ │ Constraint 2                                  [Remove] │  ║ │
│ ║ │                                                        │  ║ │
│ ║ │ Type:      [▼ Minimum Trip Count]                     │  ║ │
│ ║ │ Applies To: [▼ Referee]                                │  ║ │
│ ║ │ Minimum Trips: [5___]                                 │  ║ │
│ ║ └────────────────────────────────────────────────────────┘  ║ │
│ ║                                                              ║ │
│ ║ [+ Add Constraint]                                           ║ │
│ ╚══════════════════════════════════════════════════════════════╝ │
│                                                                    │
│ ╔══════════════════════════════════════════════════════════════╗ │
│ ║ REWARDS                                                      ║ │
│ ╠══════════════════════════════════════════════════════════════╣ │
│ ║                                                              ║ │
│ ║ ┌────────────────────────────────────────────────────────┐  ║ │
│ ║ │ Reward 1                                      [Remove] │  ║ │
│ ║ │                                                        │  ║ │
│ ║ │ Type:  [▼ Free Ride]                                   │  ║ │
│ ║ │ Value: N/A (awards 1 free ride)                       │  ║ │
│ ║ └────────────────────────────────────────────────────────┘  ║ │
│ ║                                                              ║ │
│ ║ ┌────────────────────────────────────────────────────────┐  ║ │
│ ║ │ Reward 2                                      [Remove] │  ║ │
│ ║ │                                                        │  ║ │
│ ║ │ Type:  [▼ Wallet Credit]                               │  ║ │
│ ║ │ Credit Amount: [50___]                                │  ║ │
│ ║ └────────────────────────────────────────────────────────┘  ║ │
│ ║                                                              ║ │
│ ║ [+ Add Reward]                                               ║ │
│ ╚══════════════════════════════════════════════════════════════╝ │
│                                                                    │
│              [Cancel]  [Save Campaign]                            │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Constraint Definition Management

```
┌─────────────────────────────────────────────────────────────────┐
│ Manage Constraint Definitions          [+ Create New Definition]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Type                  │ Label                  │ Actions     ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ NONE (System)         │ No Constraint          │ [View]      ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ MIN_WALLET_BALANCE    │ Min Wallet Balance     │ [View]      ││
│ │ (System)              │                        │             ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ MIN_TRIP_COUNT        │ Min Trip Count         │ [View]      ││
│ │ (System)              │                        │             ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ MAX_REFERRAL_COUNT    │ Max Referrals          │ [View]      ││
│ │ (System)              │                        │             ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ CUSTOM_AGE_CHECK      │ Age Verification       │ [Edit][Del] ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ Note: System-defined constraints cannot be deleted              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Testing Checklist

### UI Component Testing

- [ ] **Campaign List**
  - [ ] Displays all campaigns with correct data
  - [ ] Shows constraint and reward counts
  - [ ] Status badges display correctly (Active/Inactive)
  - [ ] Edit button navigates to edit page
  - [ ] Delete button shows confirmation and deletes campaign
  - [ ] Create button navigates to create page

- [ ] **Campaign Form - Basic Fields**
  - [ ] Name field validation works
  - [ ] Description field is optional
  - [ ] Start date picker works
  - [ ] End date picker works
  - [ ] Active toggle works
  - [ ] Form loads existing data when editing

- [ ] **Campaign Form - Constraints**
  - [ ] "Add Constraint" button adds new constraint row
  - [ ] "Remove" button removes constraint row
  - [ ] Constraint type dropdown populated from API
  - [ ] "Applies To" dropdown has all three options
  - [ ] Value input shows/hides based on constraint type
  - [ ] NONE type shows "No value required"
  - [ ] MIN_WALLET_BALANCE shows amount input
  - [ ] MIN_TRIP_COUNT shows trips input
  - [ ] MAX_REFERRAL_COUNT shows referrals input
  - [ ] Can add multiple constraints
  - [ ] Constraint values persist when editing

- [ ] **Campaign Form - Rewards**
  - [ ] "Add Reward" button adds new reward row
  - [ ] "Remove" button removes reward row
  - [ ] Reward type dropdown populated from API
  - [ ] Value input shows/hides based on reward type
  - [ ] NONE type shows "No value required"
  - [ ] FREE_RIDE shows "No value required"
  - [ ] WALLET_CREDIT shows amount input
  - [ ] DISCOUNT_PERCENTAGE shows percentage input with % formatter
  - [ ] Can add multiple rewards
  - [ ] Reward values persist when editing

- [ ] **Campaign Form - Submission**
  - [ ] Validation errors display correctly
  - [ ] Loading state shows during submission
  - [ ] Success message displays on save
  - [ ] Redirects to list after save
  - [ ] Error message displays on failure
  - [ ] Cancel button navigates back to list

- [ ] **Constraint Definition Management**
  - [ ] List displays all definitions
  - [ ] System definitions show "System" badge
  - [ ] Create button opens modal/form
  - [ ] Edit button opens modal/form with data
  - [ ] Delete button disabled for system definitions
  - [ ] Delete button works for custom definitions
  - [ ] Create form validates type and label

- [ ] **Reward Definition Management**
  - [ ] List displays all definitions
  - [ ] System definitions show "System" badge
  - [ ] Create button opens modal/form
  - [ ] Edit button opens modal/form with data
  - [ ] Delete button disabled for system definitions
  - [ ] Delete button works for custom definitions
  - [ ] Create form validates type and label

### Integration Testing

- [ ] Create campaign with constraints and rewards
- [ ] Verify data saved correctly via GraphQL
- [ ] Edit campaign and update constraints
- [ ] Verify old constraints removed and new ones added
- [ ] Delete campaign and verify cascade delete
- [ ] Create custom constraint definition
- [ ] Use custom constraint in campaign
- [ ] Create custom reward definition
- [ ] Use custom reward in campaign
- [ ] Attempt to delete system definition (should fail)

### Browser Testing

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile responsive view
- [ ] Test form validation across browsers
- [ ] Test date pickers across browsers

---

## Implementation Order

1. **Setup** - Install dependencies, configure Apollo Client
2. **Types** - Create TypeScript interfaces
3. **GraphQL** - Create queries and mutations
4. **Campaign List** - Implement list view
5. **Campaign Form** - Implement create/edit form
6. **Constraint Section** - Implement constraint management UI
7. **Reward Section** - Implement reward management UI
8. **Value Inputs** - Implement dynamic value input components
9. **Definition Management** - Implement definition CRUD UI
10. **Testing** - Run through complete testing checklist
11. **Refinement** - Polish UI/UX based on feedback

---

## Notes

- **UI Library:** The examples use Ant Design (`antd`). Adapt to your UI library (Material-UI, Chakra UI, etc.)
- **Form State:** Consider using form libraries like React Hook Form or Formik for complex validation
- **Error Handling:** Implement proper error boundaries and user-friendly error messages
- **Loading States:** Always show loading indicators during async operations
- **Accessibility:** Ensure all form inputs have proper labels and ARIA attributes

---

## Support

For questions or issues during implementation, refer to:
- Main instruction document: `REFERRAL_REFACTOR_INSTRUCTIONS.md`
- Backend implementation guide: `updates/backend/REFERRAL_SYSTEM_REFACTOR.md`
- Apollo Client docs: https://www.apollographql.com/docs/react
- Ant Design docs: https://ant.design/components/overview

---

**End of Admin Panel Implementation Guide**
