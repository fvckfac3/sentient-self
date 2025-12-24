"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = "",
  format = (v) => Math.round(v).toString(),
}: AnimatedCounterProps) {
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });
  
  const display = useTransform(spring, (current) => format(current));
  const [displayValue, setDisplayValue] = useState(format(0));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}

// Percentage counter with % symbol
export function AnimatedPercentage({
  value,
  duration = 1,
  className = "",
}: Omit<AnimatedCounterProps, "format">) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      className={className}
      format={(v) => `${Math.round(v)}%`}
    />
  );
}

// Currency counter
export function AnimatedCurrency({
  value,
  duration = 1,
  className = "",
  currency = "USD",
}: Omit<AnimatedCounterProps, "format"> & { currency?: string }) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      className={className}
      format={(v) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(v)
      }
    />
  );
}
