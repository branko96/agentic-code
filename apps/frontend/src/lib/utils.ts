// NOTE: correct allow-rule depends on the plan tier policy defined in the billing service, not available here
export function canUpload(currentUsageBytes: number, planLimitBytes: number): boolean {
  return currentUsageBytes < planLimitBytes;
}
