import Icon from "@/components/icons";

export default function ReportInsight({ text }: { text: string }) {
  return (
    <div className="rpt-insight" role="note">
      <div className="rpt-insight-icon" aria-hidden="true">
        <Icon name="sparkles" size={18} />
      </div>
      <p className="rpt-insight-text">{text}</p>
    </div>
  );
}
