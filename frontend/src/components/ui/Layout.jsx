import React from 'react';
import { motion } from 'framer-motion';

export function Card({ className = "", children, hoverEffect = true, ...props }) {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5 } : {}}
            className={`
        bg-[#111111] border border-zinc-900/50 rounded-xl p-6
        ${hoverEffect ? 'hover:border-zinc-800 transition-colors duration-300' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function Section({ className = "", children, id = "", ...props }) {
    return (
        <section
            id={id}
            className={`py-24 md:py-32 relative overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </section>
    );
}

export function Container({ className = "", children, ...props }) {
    return (
        <div className={`mx-auto w-full max-w-7xl px-6 md:px-8 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function Input({ className = "", label, id, error, ...props }) {
    return (
        <div className="space-y-2">
            {label && <label htmlFor={id} className="text-sm font-medium text-zinc-400">{label}</label>}
            <input
                id={id}
                className={`
          flex h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none
          focus:border-white focus:ring-0 transition-colors duration-200
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
