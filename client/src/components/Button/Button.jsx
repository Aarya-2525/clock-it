import { motion } from 'motion/react';
import { Icon } from '../Icon/Icon';
import './Button.css';

// One pressable for the whole app. `icon` alone renders a square icon button;
// pass `label` for its accessible name.
export function Button({ icon, children, label, variant = 'ghost', size = 'md', className = '', ...rest }) {
  const iconOnly = icon && !children;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`btn btn--${variant} btn--${size} ${iconOnly ? 'btn--icon' : ''} ${className}`}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} />}
      {children}
    </motion.button>
  );
}
