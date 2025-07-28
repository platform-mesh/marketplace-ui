import { inject } from '@angular/core';
import { AnalyticsTrackerService } from '@dxp/ngx-core/analytics-tracker';

export function initializeMatomo(): () => void {
  const analyticsTrackerService = inject(AnalyticsTrackerService);
  analyticsTrackerService.injectScript(true).then((_) => undefined);
  return () => undefined;
}
