import { PortalContext } from './portal-context';
import { GoBackContext } from 'models/luigi-go-back';

export interface EntityConfig {
  contextProperty: string;
}

// eslint-disable-line @typescript-eslint/no-explicit-any
export interface NodeContext extends Record<string, any> {
  token: string;
  accountId: string;
  userId: string;
  tenantId: string;
  organization: string;
  organizationId: string; // to be removed once migrated to the organizationId
  entityType: string;
  portalBaseUrl: string;
  portalContext: PortalContext;
  serviceProviderConfig: Record<string, string>;
  entityId: string;
  entity: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  componentId?: string;
  profileUserId?: string;
  analyticsTrackerConfig: AnalyzerTrackingConfig;
  dashboard?: {
    sections: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    sidebar: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  entityContext: {
    [key: string]: {
      id: string;
      displayName: string;
      description?: string;
      policies: string[];
      automaticdNamespace?: string;
      type?: string;
      extensions?: {
        dora?: {
          identifier: string;
        };
        piper?: {
          enabled: boolean;
        };
      };
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goBackContext?: GoBackContext | any;
  parentNavigationContexts: string[];
  providerName?: string;
}

export interface AnalyzerTrackingConfig {
  siteUrl?: string;
  jukeboxMatomoContainerId?: string;
  tenantIds?: string[];
}
