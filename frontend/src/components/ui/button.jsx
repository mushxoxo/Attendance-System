import * as React from "react"

const getButtonClasses = (variant, size, className) => {
  let base = "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-250 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ";

  const variants = {
    default:     "rounded-lg bg-blue-500 text-white shadow hover:bg-blue-600 ",
    destructive: "rounded-lg bg-red-600 text-white shadow hover:bg-red-700 ",
    outline:     "rounded-lg border text-gray-900 shadow-sm hover:bg-gray-50 ",
    secondary:   "rounded-lg text-gray-900 shadow-sm hover:bg-gray-100 ",
    ghost:       "rounded-lg hover:bg-gray-100 text-gray-900 ",
    link:        "text-blue-600 underline-offset-4 hover:underline ",
    gradient:    "rounded-lg text-white shadow-md ",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm ",
    sm:      "h-8 px-3 py-1 text-xs rounded-md ",
    lg:      "h-11 px-8 py-2 text-base ",
    xl:      "h-13 px-10 py-3 text-lg ",
    icon:    "h-9 w-9 p-0 rounded-lg ",
  };

  let classes = base + (variants[variant] || variants.default) + (sizes[size] || sizes.default);

  // Dark glassmorphic overrides per variant
  const darkOverride = {
    outline: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#f1f5f9',
    },
    secondary: {
      background: 'rgba(255,255,255,0.08)',
      color: '#f1f5f9',
    },
    ghost: {
      color: '#f1f5f9',
    },
  };

  if (className) classes += className;
  return { classes, darkOverride: darkOverride[variant] };
};

const gradientStyle = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
};

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  style,
  ...props
}, ref) => {
  const { classes, darkOverride } = getButtonClasses(variant, size, className);
  const combinedStyle = {
    ...(variant === 'gradient' ? gradientStyle : darkOverride || {}),
    ...style,
  };

  return (
    <button
      className={classes}
      ref={ref}
      style={combinedStyle}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
