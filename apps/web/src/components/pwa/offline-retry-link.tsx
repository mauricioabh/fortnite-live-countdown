"use client";

export const OfflineRetryLink = () => {
  return (
    <button
      type="button"
      className="rounded-lg bg-primary px-lg py-sm text-sm font-semibold text-primary-foreground"
      onClick={() => {
        window.location.assign("/");
      }}
    >
      Retry
    </button>
  );
};
