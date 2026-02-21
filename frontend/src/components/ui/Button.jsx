import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 border border-transparent",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800",
    outline: "bg-transparent text-white border border-zinc-800 hover:border-white hover:bg-black",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50",
    link: "bg-transparent text-white underline-offset-4 hover:underline p-0 h-auto font-normal",
};

const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg font-medium",
    icon: "h-10 w-10",
};

export function Button({
    className = "",
    variant = "primary",
    size = "md",
    children,
    isLoading,
    as: Component = motion.button,
    ...props
}) {
    return (
        <Component
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {isLoading && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </Component>
    );
}
