import React, { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const THRESHOLD = 72;

export default function PullToRefresh({ children }) {
  const queryClient = useQueryClient();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullY(Math.min(delta * 0.45, THRESHOLD + 20));
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(0);
      await queryClient.invalidateQueries();
      setRefreshing(false);
    } else {
      setPullY(0);
    }
    startY.current = null;
  }, [pullY, queryClient]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ overscrollBehaviorY: "none" }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullY > 8 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-full px-4 py-2 shadow-xl">
              <RefreshCw
                size={16}
                className={`text-[#7c6bff] ${refreshing ? "animate-spin" : ""}`}
                style={!refreshing ? { transform: `rotate(${progress * 360}deg)` } : {}}
              />
              <span className="text-xs text-white/70">
                {refreshing ? "Atualizando..." : progress >= 1 ? "Solte para atualizar" : "Puxe para atualizar"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ transform: `translateY(${pullY}px)`, transition: pullY === 0 ? "transform 0.3s ease" : "none" }}>
        {children}
      </div>
    </div>
  );
}