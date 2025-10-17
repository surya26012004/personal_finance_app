
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    currency?: string;
    precision?: number;
    className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, currency = '₹', precision = 0, className = '' }) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 200,
    });

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration: 1,
            ease: 'easeOut',
        });
        return controls.stop;
    }, [value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            const element = document.getElementById(`counter-${currency}`);
            if (element) {
                element.textContent = `${currency} ${latest.toLocaleString('en-IN', {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision,
                })}`;
            }
        });
        return unsubscribe;
    }, [springValue, currency, precision]);

    return <motion.span id={`counter-${currency}`} className={className} />;
};

export default AnimatedCounter;
