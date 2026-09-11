function AudioToggle({
  enabled,
  onToggle,
  compact = false,
  className = "",
}) {
  return (
    <button
      type="button"
      className={[
        "ob-audio-toggle",
        enabled
          ? "ob-audio-toggle-on"
          : "ob-audio-toggle-off",
        compact
          ? "ob-audio-toggle-compact"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Turn game audio off"
          : "Turn game audio on"
      }
      title={
        enabled
          ? "Audio on"
          : "Audio off"
      }
    >
      <span
        className="ob-audio-toggle-icon"
        aria-hidden="true"
      >
        {enabled ? "🔊" : "🔇"}
      </span>

      {!compact && (
        <span className="ob-audio-toggle-text">
          AUDIO
          <strong>
            {enabled ? "ON" : "OFF"}
          </strong>
        </span>
      )}

      <span
        className="ob-audio-toggle-switch"
        aria-hidden="true"
      >
        <span className="ob-audio-toggle-knob" />
      </span>
    </button>
  );
}

export default AudioToggle;