# Framework-Specific CSS/Styling Fix Recipes

## Tailwind CSS
```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/2">...</div>
</div>
```

## React + CSS Modules
```tsx
import styles from './Component.module.css';
export function Component() {
  return <div className={styles.container}>...</div>;
}
```

## Common Patterns
- Flexbox centering: `display: flex; align-items: center; justify-content: center;`
- Grid auto-fit: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));`
- Focus visible: `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`
