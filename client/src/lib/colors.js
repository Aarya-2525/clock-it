// Ten task colours. Values live in CSS (--k-<id>) so each theme can tune them.
export const COLORS = [
  { id: 'red', label: 'Red' },
  { id: 'orange', label: 'Orange' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'teal', label: 'Teal' },
  { id: 'sky', label: 'Sky' },
  { id: 'blue', label: 'Blue' },
  { id: 'purple', label: 'Purple' },
  { id: 'pink', label: 'Pink' },
  { id: 'slate', label: 'Slate' },
];

export const colorValue = (id) => `var(--k-${id})`;
