"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  AdvancedFilters,
  DEFAULT_ADVANCED,
  QuickFilterId,
  cardToMission,
  countActiveFilters,
  filterExploreMissionCards,
} from "@/lib/explore-mobile-data";
import type { MissionCard } from "@/lib/data/mission-cards";
import { saveMissionAction, unsaveMissionAction } from "@/app/(volunteer)/actions";
import MobileExploreHeader from "./mobile-explore-header";
import MobileMissionSearch from "./mobile-mission-search";
import QuickFilterRail from "./quick-filter-rail";
import ExploreFilterSheet from "./explore-filter-sheet";
import FeaturedMatchCard from "./featured-match-card";
import MobileMapPreview, { ExploreMapSheet } from "./mobile-map-preview";
import MissionFeedCard from "./mission-feed-card";
import ExploreEmptyState, { ExploreSkeleton } from "./explore-empty-state";
import ExploreMissionPreviewSheet from "./explore-mission-preview-sheet";
import MobileFilterActionBar from "./mobile-filter-action-bar";

export default function ExploreMobileExperience({ cards = [] }: { cards?: MissionCard[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilterId[]>([]);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [draftAdvanced, setDraftAdvanced] = useState<AdvancedFilters>(DEFAULT_ADVANCED);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [preview, setPreview] = useState<MissionCard | null>(null);
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(cards.filter((c) => c.isSaved).map((c) => c.mission.slug))
  );
  const [toast, setToast] = useState(false);

  const slugToId = useMemo(
    () => new Map(cards.map((c) => [c.mission.slug, c.mission.id])),
    [cards]
  );

  const filtered = filterExploreMissionCards(search, quickFilters, advanced, "All", cards, false);
  const filterCount = countActiveFilters(quickFilters, advanced);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("exp-has-filter-bar", filterCount > 0);
    return () => document.body.classList.remove("exp-has-filter-bar");
  }, [filterCount]);

  useEffect(() => {
    if (!filterSheetOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [filterSheetOpen]);

  const featured = filtered[0];
  const listMissions = filtered.slice(1);

  const toggleQuick = (id: QuickFilterId) => {
    setQuickFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSave = useCallback(
    (slug: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const id = slugToId.get(slug);
      if (!id) return;
      const willSave = !saved.has(slug);
      // optimistic
      setSaved((prev) => {
        const next = new Set(prev);
        if (willSave) next.add(slug);
        else next.delete(slug);
        return next;
      });
      if (willSave) {
        setToast(true);
        setTimeout(() => setToast(false), 2400);
      }
      void (async () => {
        const res = willSave ? await saveMissionAction(id) : await unsaveMissionAction(id);
        if (!res.ok) {
          // revert
          setSaved((prev) => {
            const next = new Set(prev);
            if (willSave) next.delete(slug);
            else next.add(slug);
            return next;
          });
          if (res.code === "auth") router.push(`/auth?next=${encodeURIComponent(pathname)}`);
        } else {
          router.refresh();
        }
      })();
    },
    [saved, slugToId, router, pathname]
  );

  const resetAll = () => {
    setSearch("");
    setQuickFilters([]);
    setAdvanced(DEFAULT_ADVANCED);
    setDraftAdvanced(DEFAULT_ADVANCED);
  };

  const openFilters = () => {
    setDraftAdvanced(advanced);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setAdvanced(draftAdvanced);
    setFilterSheetOpen(false);
  };

  return (
    <>
      <MobileExploreHeader />
      <MobileMissionSearch
        value={search}
        onChange={setSearch}
        onFilterOpen={openFilters}
        filterCount={filterCount}
        focused={searchFocused}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        onSuggestion={(s) => {
          setSearch(s);
          setSearchFocused(false);
        }}
      />
      <QuickFilterRail
        selected={quickFilters}
        onToggle={toggleQuick}
        matchCount={filtered.length}
      />

      {loading ? (
        <ExploreSkeleton />
      ) : filtered.length === 0 ? (
        <ExploreEmptyState onReset={resetAll} />
      ) : (
        <>
          {featured && (
            <FeaturedMatchCard
              card={featured}
              saved={saved.has(featured.mission.slug)}
              onOpen={() => setPreview(featured)}
              onSave={(e) => toggleSave(featured.mission.slug, e)}
            />
          )}

          {listMissions.length > 0 && (
            <section className="exp-feed exp-mobile-only" aria-labelledby="exp-feed-heading">
              <h2 id="exp-feed-heading" className="exp-section-heading exp-feed-heading">
                All missions
              </h2>
              <div className="exp-feed-list">
                {listMissions.map((card, i) => (
                  <MissionFeedCard
                    key={card.mission.id}
                    card={card}
                    index={i}
                    saved={saved.has(card.mission.slug)}
                    onOpen={() => setPreview(card)}
                    onSave={(e) => toggleSave(card.mission.slug, e)}
                  />
                ))}
              </div>
            </section>
          )}

          <MobileMapPreview count={filtered.length} onOpenMap={() => setMapOpen(true)} />
        </>
      )}

      <ExploreFilterSheet
        open={filterSheetOpen}
        draft={draftAdvanced}
        onChange={setDraftAdvanced}
        onClose={() => setFilterSheetOpen(false)}
        onApply={applyFilters}
        onReset={() => setDraftAdvanced(DEFAULT_ADVANCED)}
      />

      <ExploreMapSheet open={mapOpen} missions={filtered.map(cardToMission)} onClose={() => setMapOpen(false)} />

      <ExploreMissionPreviewSheet
        card={preview}
        saved={preview ? saved.has(preview.mission.slug) : false}
        onClose={() => setPreview(null)}
        onSave={() => preview && toggleSave(preview.mission.slug)}
      />

      <MobileFilterActionBar
        visible={filterCount > 0}
        filterCount={filterCount}
        matchCount={filtered.length}
        onOpenFilters={openFilters}
      />

      <div className={`exp-save-toast exp-mobile-only${toast ? " exp-save-toast--in" : ""}`} role="status">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
          <circle cx="12" cy="12" r="11" fill="#1fae82" />
          <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Saved for later
        <Link href="/my-missions" className="nl-link-coral" onClick={() => setToast(false)}>
          View saved
        </Link>
      </div>
    </>
  );
}
