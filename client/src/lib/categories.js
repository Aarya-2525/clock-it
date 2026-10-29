import { colorValue } from './colors';

// The first four are the presets offered when labelling a block;
// `other` is used when the user only types a label.
// Each category has a default colour the user can override per block.
export const CATEGORIES = [
  { id: 'work', label: 'Work', color: 'sky' },
  { id: 'sleep', label: 'Sleep', color: 'purple' },
  { id: 'eat', label: 'Eat', color: 'yellow' },
  { id: 'play', label: 'Play', color: 'pink' },
  { id: 'other', label: 'Other', color: 'green' },
];

export const PRESETS = CATEGORIES.slice(0, 4);

const byId = (id) => CATEGORIES.find((c) => c.id === id);

export const defaultColor = (categoryId) => byId(categoryId)?.color ?? 'slate';

export const categoryColor = (id) => colorValue(defaultColor(id));

export const categoryLabel = (id) => byId(id)?.label ?? id;

export const blockLabel = (block) => block.label || categoryLabel(block.category);

export const blockColor = (block) => colorValue(block.color ?? defaultColor(block.category));
