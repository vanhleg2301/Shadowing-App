"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { CollectionPicker } from "@/components/CollectionPicker";
import { Icon } from "@/components/Icon";
import { getCollection, type CollectionId } from "@/data/collections";
import type { CollectionCounts } from "@/lib/catalog";

interface CollectionSwitcherProps {
  current: CollectionId;
  counts: CollectionCounts;
}

export function CollectionSwitcher({ current, counts }: CollectionSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const collection = getCollection(current);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-1.5 text-left transition-colors hover:border-brand"
        aria-label={`Video collection: ${collection.name}. Change`}
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-accent">{collection.speedLabel} speed</span>
          <span className="block truncate text-sm font-bold text-ink">{collection.name}</span>
        </span>
        <Icon name="chevronDown" className="size-4 shrink-0 text-muted" />
      </button>
      {isOpen && (
        <BottomSheet title="Choose your videos" onClose={() => setIsOpen(false)}>
          <CollectionPicker current={current} counts={counts} onDone={() => setIsOpen(false)} isStacked />
        </BottomSheet>
      )}
    </>
  );
}
