import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ children, delay = 0, className = "", direction = 'up' }: FadeInProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: 1.2, // Slower for premium feel
                delay: delay,
                ease: [0.22, 1, 0.36, 1] as const // Custom ease for premium feel
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}
