# Supplements Module React Components

> Component architecture and usage patterns for the supplements frontend

## 🏗️ Component Architecture

### Directory Structure
```
src/app/(app)/supplements/
├── components/           # Shared supplement components
│   ├── SupplementCard.tsx
│   ├── StackBuilder.tsx
│   ├── IntakeTracker.tsx
│   ├── InteractionWarning.tsx
│   └── SearchBox.tsx
├── page.tsx             # Main supplements dashboard
├── search/              # Search & discovery
│   └── page.tsx
├── stacks/              # Stack management  
│   ├── page.tsx         # Stack list
│   ├── [id]/           # Stack details
│   │   └── page.tsx
│   └── create/         # Stack creation
│       └── page.tsx
├── intake/              # Daily logging
│   └── page.tsx
└── analysis/            # Intelligence features
    └── page.tsx
```

## 📄 Core Page Components

### Main Dashboard (`page.tsx`)
The central hub displaying active stack, today's intake, and quick actions.

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveStack, getTodaysIntake } from '@/lib/supplements-api';
import { StackOverview } from './components/StackOverview';
import { TodaysIntake } from './components/TodaysIntake';
import { QuickActions } from './components/QuickActions';
import { IntelligencePanel } from './components/IntelligencePanel';

export default function SupplementsPage() {
  const { data: activeStack } = useQuery({
    queryKey: ['active-stack'],
    queryFn: getActiveStack
  });

  const { data: todaysIntake } = useQuery({
    queryKey: ['todays-intake', new Date().toISOString().split('T')[0]],
    queryFn: () => getTodaysIntake(new Date().toISOString().split('T')[0])
  });

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Supplements</h1>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{todaysIntake?.taken || 0}</div>
            <div className="text-sm opacity-90">Taken Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{activeStack?.item_count || 0}</div>
            <div className="text-sm opacity-90">In Active Stack</div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StackOverview stack={activeStack} />
          <TodaysIntake intake={todaysIntake} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <IntelligencePanel />
        </div>
      </div>
    </div>
  );
}
```

### Stack Management (`stacks/page.tsx`)
List and manage user supplement stacks.

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStacks, activateStack, deleteStack } from '@/lib/supplements-api';
import { StackCard } from '../components/StackCard';
import { CreateStackModal } from '../components/CreateStackModal';
import { Button } from '@/components/ui/Button';

export default function StacksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: stacks } = useQuery({
    queryKey: ['stacks'],
    queryFn: getStacks
  });

  const activateMutation = useMutation({
    mutationFn: activateStack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] });
      queryClient.invalidateQueries({ queryKey: ['active-stack'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supplement Stacks</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Stack
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stacks?.map(stack => (
          <StackCard
            key={stack.id}
            stack={stack}
            onActivate={() => activateMutation.mutate(stack.id)}
            onDelete={() => deleteMutation.mutate(stack.id)}
          />
        ))}
      </div>

      <CreateStackModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
```

## 🧩 Reusable Components

### SupplementCard
Displays supplement information in a card format with actions.

```tsx
interface Supplement {
  id: string;
  name: string;
  category: string;
  evidence_grade: string;
  serving_size: string;
  cost_per_serving: number;
  benefits: string[];
}

interface SupplementCardProps {
  supplement: Supplement;
  onAdd?: (supplement: Supplement) => void;
  onView?: (supplement: Supplement) => void;
  showActions?: boolean;
}

export function SupplementCard({ 
  supplement, 
  onAdd, 
  onView, 
  showActions = true 
}: SupplementCardProps) {
  const evidenceColor = {
    'A+': 'bg-green-100 text-green-800',
    'A': 'bg-green-100 text-green-800',
    'B': 'bg-yellow-100 text-yellow-800',
    'C': 'bg-orange-100 text-orange-800',
    'F': 'bg-red-100 text-red-800'
  }[supplement.evidence_grade] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{supplement.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${evidenceColor}`}>
          {supplement.evidence_grade}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Category:</span> {supplement.category}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Serving:</span> {supplement.serving_size}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Cost:</span> ${supplement.cost_per_serving?.toFixed(2)}/serving
        </div>
      </div>

      {supplement.benefits?.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Benefits:</div>
          <div className="flex flex-wrap gap-1">
            {supplement.benefits.slice(0, 3).map(benefit => (
              <span 
                key={benefit}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onAdd?.(supplement)}
          >
            Add to Stack
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView?.(supplement)}
          >
            View Details
          </Button>
        </div>
      )}
    </div>
  );
}
```

### SearchBox
Smart search with category filtering and real-time results.

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchSupplements } from '@/lib/supplements-api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { debounce } from '@/lib/utils';

interface SearchBoxProps {
  onResults: (results: Supplement[]) => void;
  placeholder?: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Vitamin', label: 'Vitamins' },
  { value: 'Mineral', label: 'Minerals' },
  { value: 'Performance', label: 'Performance' },
  { value: 'AAS', label: 'AAS' },
  { value: 'SARM', label: 'SARMs' },
  { value: 'Peptide', label: 'Peptides' }
];

export function SearchBox({ onResults, placeholder }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Debounce search query
  const debouncedQuery = useMemo(
    () => debounce((q: string) => setQuery(q), 300),
    []
  );

  const { data: results } = useQuery({
    queryKey: ['supplement-search', query, category],
    queryFn: () => searchSupplements({ 
      q: query, 
      category: category === 'all' ? undefined : category 
    }),
    enabled: query.length >= 2 || category !== 'all'
  });

  useEffect(() => {
    onResults(results || []);
  }, [results, onResults]);

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Input
          placeholder={placeholder || "Search supplements..."}
          onChange={(e) => debouncedQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-48">
        <Select
          value={category}
          onChange={setCategory}
          options={CATEGORIES}
        />
      </div>
    </div>
  );
}
```

### IntakeTracker
Daily supplement logging interface with batch actions.

```tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logIntake } from '@/lib/supplements-api';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

interface IntakeItem {
  stack_item_id: string;
  name: string;
  dose: string;
  dose_unit: string;
  timing: string;
  log_status: 'taken' | 'skipped' | 'pending' | 'snoozed';
  taken_at?: string;
}

interface IntakeTrackerProps {
  items: IntakeItem[];
  date: string;
}

export function IntakeTracker({ items, date }: IntakeTrackerProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) => 
      logIntake(itemId, { status, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-intake', date] });
    }
  });

  const handleBatchTaken = async () => {
    for (const itemId of selectedItems) {
      await logMutation.mutateAsync({ itemId, status: 'taken' });
    }
    setSelectedItems(new Set());
  };

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const pendingItems = items.filter(item => item.log_status === 'pending');

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Today's Supplements</h3>
        {selectedItems.size > 0 && (
          <Button onClick={handleBatchTaken} disabled={logMutation.isLoading}>
            Mark {selectedItems.size} as Taken
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <IntakeItem
            key={item.stack_item_id}
            item={item}
            selected={selectedItems.has(item.stack_item_id)}
            onToggle={() => handleItemToggle(item.stack_item_id)}
            onStatusChange={(status) => 
              logMutation.mutate({ itemId: item.stack_item_id, status })
            }
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No supplements scheduled for today
        </div>
      )}
    </div>
  );
}

function IntakeItem({ 
  item, 
  selected, 
  onToggle, 
  onStatusChange 
}: {
  item: IntakeItem;
  selected: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
}) {
  const statusColors = {
    taken: 'bg-green-50 border-green-200',
    skipped: 'bg-red-50 border-red-200',
    pending: 'bg-gray-50 border-gray-200',
    snoozed: 'bg-yellow-50 border-yellow-200'
  };

  return (
    <div className={`p-3 rounded border-2 ${statusColors[item.log_status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selected}
            onChange={onToggle}
            disabled={item.log_status === 'taken'}
          />
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-600">
              {item.dose} {item.dose_unit} • {item.timing}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {item.log_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange('taken')}
              >
                ✓ Taken
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStatusChange('skipped')}
              >
                Skip
              </Button>
            </>
          )}
          {item.log_status === 'taken' && item.taken_at && (
            <span className="text-sm text-green-600">
              ✓ {new Date(item.taken_at).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### InteractionWarning
Displays supplement interaction alerts with severity levels.

```tsx
interface Interaction {
  id: string;
  supplement1_name: string;
  supplement2_name: string;
  severity: 'critical' | 'warning' | 'caution' | 'info';
  description_en: string;
  recommendation_en: string;
  timing_recommendation?: string;
}

interface InteractionWarningProps {
  interactions: Interaction[];
}

export function InteractionWarning({ interactions }: InteractionWarningProps) {
  if (interactions.length === 0) return null;

  const severityConfig = {
    critical: {
      color: 'bg-red-50 border-red-200 text-red-800',
      icon: '🚨',
      title: 'Critical Interaction'
    },
    warning: {
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      icon: '⚠️',
      title: 'Warning'
    },
    caution: {
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: '⚡',
      title: 'Caution'
    },
    info: {
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ️',
      title: 'Information'
    }
  };

  return (
    <div className="space-y-3">
      {interactions.map(interaction => {
        const config = severityConfig[interaction.severity];
        
        return (
          <div 
            key={interaction.id}
            className={`p-4 rounded border-2 ${config.color}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{config.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {config.title}: {interaction.supplement1_name} + {interaction.supplement2_name}
                </h4>
                <p className="text-sm mb-2">
                  {interaction.description_en}
                </p>
                {interaction.recommendation_en && (
                  <p className="text-sm font-medium">
                    💡 {interaction.recommendation_en}
                  </p>
                )}
                {interaction.timing_recommendation && (
                  <p className="text-xs mt-1 opacity-80">
                    Timing: {interaction.timing_recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### StackBuilder
Interactive stack creation and editing interface.

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { searchSupplements, createStack, addStackItem } from '@/lib/supplements-api';
import { SearchBox } from './SearchBox';
import { SupplementCard } from './SupplementCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface StackBuilderProps {
  onComplete: (stackId: string) => void;
}

export function StackBuilder({ onComplete }: StackBuilderProps) {
  const [stackInfo, setStackInfo] = useState({
    name: '',
    description: '',
    goal: 'custom'
  });
  const [selectedSupplements, setSelectedSupplements] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const createStackMutation = useMutation({
    mutationFn: createStack,
    onSuccess: async (stack) => {
      // Add all selected supplements to the new stack
      for (const [index, supplement] of selectedSupplements.entries()) {
        await addStackItem(stack.id, {
          supplement_id: supplement.id,
          dose: supplement.dose || supplement.serving_size,
          dose_unit: supplement.dose_unit || supplement.serving_unit,
          frequency: supplement.frequency || 'daily',
          timing: supplement.timing || 'morning',
          sort_order: index
        });
      }
      onComplete(stack.id);
    }
  });

  const handleAddSupplement = (supplement: any) => {
    if (!selectedSupplements.find(s => s.id === supplement.id)) {
      setSelectedSupplements(prev => [...prev, {
        ...supplement,
        dose: supplement.serving_size || '',
        dose_unit: supplement.serving_unit || 'mg',
        frequency: 'daily',
        timing: 'morning'
      }]);
    }
  };

  const handleRemoveSupplement = (supplementId: string) => {
    setSelectedSupplements(prev => prev.filter(s => s.id !== supplementId));
  };

  const handleSupplementUpdate = (supplementId: string, updates: any) => {
    setSelectedSupplements(prev => 
      prev.map(s => s.id === supplementId ? { ...s, ...updates } : s)
    );
  };

  const handleCreateStack = () => {
    if (stackInfo.name && selectedSupplements.length > 0) {
      createStackMutation.mutate(stackInfo);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stack Info */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Stack Information</h3>
        <div className="space-y-4">
          <Input
            label="Stack Name"
            value={stackInfo.name}
            onChange={(e) => setStackInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Morning Foundation"
          />
          <Textarea
            label="Description"
            value={stackInfo.description}
            onChange={(e) => setStackInfo(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What is this stack for?"
          />
        </div>
      </div>

      {/* Supplement Search */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Add Supplements</h3>
        <SearchBox onResults={setSearchResults} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {searchResults.map(supplement => (
            <SupplementCard
              key={supplement.id}
              supplement={supplement}
              onAdd={handleAddSupplement}
            />
          ))}
        </div>
      </div>

      {/* Selected Supplements */}
      {selectedSupplements.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Selected Supplements ({selectedSupplements.length})
          </h3>
          
          <div className="space-y-4">
            {selectedSupplements.map((supplement, index) => (
              <StackItem
                key={supplement.id}
                supplement={supplement}
                index={index}
                onUpdate={(updates) => handleSupplementUpdate(supplement.id, updates)}
                onRemove={() => handleRemoveSupplement(supplement.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleCreateStack}
          disabled={!stackInfo.name || selectedSupplements.length === 0 || createStackMutation.isLoading}
          size="lg"
        >
          {createStackMutation.isLoading ? 'Creating...' : 'Create Stack'}
        </Button>
      </div>
    </div>
  );
}

function StackItem({ supplement, index, onUpdate, onRemove }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium">{supplement.name}</div>
        <div className="text-sm text-gray-600">{supplement.category}</div>
      </div>
      
      <div className="flex gap-3">
        <Input
          type="number"
          value={supplement.dose}
          onChange={(e) => onUpdate({ dose: e.target.value })}
          placeholder="Dose"
          className="w-20"
        />
        <select
          value={supplement.dose_unit}
          onChange={(e) => onUpdate({ dose_unit: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="mg">mg</option>
          <option value="g">g</option>
          <option value="mcg">mcg</option>
          <option value="IU">IU</option>
        </select>
        <select
          value={supplement.frequency}
          onChange={(e) => onUpdate({ frequency: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="daily">Daily</option>
          <option value="2x_daily">2x Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <select
          value={supplement.timing}
          onChange={(e) => onUpdate({ timing: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
          <option value="pre_workout">Pre-Workout</option>
          <option value="bedtime">Bedtime</option>
        </select>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700"
      >
        Remove
      </Button>
    </div>
  );
}
```

## 🎨 UI Component Library

The supplements module uses the shared `@lumeos/ui` component library:

### Base Components
- `Button` - Primary actions and interactions
- `Input` - Text input with validation
- `Select` - Dropdown selections
- `Checkbox` - Multi-select options
- `Modal` - Overlay dialogs
- `Card` - Content containers
- `Badge` - Status indicators

### Styling System
- **TailwindCSS** for utility-first styling
- **Design Tokens** for consistent colors, spacing, typography
- **Responsive Design** with mobile-first approach
- **Dark Mode Support** (planned)

## 🔄 State Management

### React Query Integration
```tsx
// API client with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for consistent caching
export const supplementsKeys = {
  all: ['supplements'] as const,
  stacks: () => [...supplementsKeys.all, 'stacks'] as const,
  stack: (id: string) => [...supplementsKeys.stacks(), id] as const,
  activeStack: () => [...supplementsKeys.stacks(), 'active'] as const,
  intake: (date: string) => [...supplementsKeys.all, 'intake', date] as const,
  search: (params: any) => [...supplementsKeys.all, 'search', params] as const,
};

// Optimistic updates for better UX
const logIntakeMutation = useMutation({
  mutationFn: logIntake,
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: supplementsKeys.intake(variables.date) });
    
    // Snapshot previous value
    const previousIntake = queryClient.getQueryData(supplementsKeys.intake(variables.date));
    
    // Optimistically update
    queryClient.setQueryData(supplementsKeys.intake(variables.date), old => ({
      ...old,
      items: old.items.map(item => 
        item.stack_item_id === variables.itemId 
          ? { ...item, log_status: variables.status, taken_at: new Date().toISOString() }
          : item
      )
    }));
    
    return { previousIntake };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousIntake) {
      queryClient.setQueryData(supplementsKeys.intake(variables.date), context.previousIntake);
    }
  }
});
```

### Zustand Store for UI State
```tsx
import { create } from 'zustand';

interface SupplementsUIStore {
  selectedItems: Set<string>;
  searchQuery: string;
  selectedCategory: string;
  showCreateModal: boolean;
  
  toggleItem: (itemId: string) => void;
  setSearch: (query: string, category: string) => void;
  clearSelection: () => void;
  setShowCreateModal: (show: boolean) => void;
}

export const useSupplementsUI = create<SupplementsUIStore>((set) => ({
  selectedItems: new Set(),
  searchQuery: '',
  selectedCategory: 'all',
  showCreateModal: false,
  
  toggleItem: (itemId) => set((state) => {
    const newSelected = new Set(state.selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    return { selectedItems: newSelected };
  }),
  
  setSearch: (query, category) => set({ 
    searchQuery: query, 
    selectedCategory: category 
  }),
  
  clearSelection: () => set({ selectedItems: new Set() }),
  
  setShowCreateModal: (show) => set({ showCreateModal: show })
}));
```

This component architecture provides a scalable, maintainable foundation for the supplements frontend with excellent user experience and performance.