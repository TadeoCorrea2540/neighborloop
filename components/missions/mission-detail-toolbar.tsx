"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Icon from "@/components/icons";
import SaveButton from "@/components/volunteer/save-button";

export default function MissionDetailToolbar({
  missionId,
  missionTitle,
  initialSaved,
}: {
  missionId: string;
  missionTitle: string;
  initialSaved: boolean;
}) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  const onShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: missionTitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
      window.setTimeout(() => setShareNote(null), 2200);
    } catch {
      /* user cancelled share */
    }
  }, [missionTitle]);

  return (
    <div className="md-toolbar">
      <Link href="/explore" className="md-toolbar-btn" aria-label="Back to explore">
        <Icon name="arrow-left" size={18} />
      </Link>
      <div className="md-toolbar-right">
        {shareNote && (
          <span className="md-toolbar-toast" role="status">
            {shareNote}
          </span>
        )}
        <div className="md-toolbar-save">
          <SaveButton missionId={missionId} initialSaved={initialSaved} />
        </div>
        <button type="button" className="md-toolbar-btn" onClick={onShare} aria-label="Share mission">
          <Icon name="share" size={17} />
        </button>
      </div>
    </div>
  );
}
