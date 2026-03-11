import { MessageStripType } from '@fundamental-ngx/core';
import { Verification } from 'models/verification';

export interface Account {
  id: string;
  name: string;
  displayName: string;
  type: AccountType;
  subType?: string;
  ref: string;
  link?: string;
}

export interface AccountConnection {
  description: string;
  displayName: string;
  name: string;
  image: {
    url: string;
  };
  type: AccountConnectionType;
  subType?: string;
}

export interface AccountConnectionType {
  context: string;
  name: string;
  apiResourceConfig: APIResourceConfig;
}

export interface APIResourceConfig {
  wizardConfig: ProviderWizardConfig;
  displayConfig: APIResourceDisplayConfig;
}

export interface APIResourceDisplayConfig {
  apiServerConfig: APIServerConfig;
  resourceConfig: ResourceConfig;
  tableConfig: TableConfig;
  accountAssignmentConfig?: AccountAssignmentConfig;
  accountNamingConfig?: AccountNamingConfig;
}

export interface AccountNamingConfig {
  singular: string;
  plural: string;
}

export interface AccountAssignmentConfig {
  nameDataPath: string;
  addAccountTitle?: string;
  noAccountsFoundTitle?: string;
}

export interface ResourceConfig {
  groupVersion: string;
  kind: string;
}

export interface APIServerConfig {
  host: string;
  namespaceRetrievalStrategy: string;
}

export interface TableConfig {
  columns: ColumnConfig[];
  actions?: ActionsConfig;
  messageStrip?: MessageStripConfig[];
}

export interface MessageStripConfig {
  type: MessageStripType;
  text: string;
  noIcon: boolean;
  dismissible: boolean;
}

export interface ActionsConfig {
  additionalActions: ActionConfig[];
  globalActions: GlobalAccountActionConfig[];
}

export interface ActionConfig {
  id: string;
  glyph: string;
  displayName: string;
  condition: string;
  executionPayload?: ExecutionPayload;
  requiredPolicies?: string[];
  confirmationPopup?: ActionPopupConfig;
  actionSuccessMessage?: string;
}

export interface GlobalAccountActionConfig {
  id: string;
  glyph: string;
  displayName: string;
  condition: string;
  actionConfig?: GlobalActionConfig;
  requiredPolicies?: string[];
}

export interface GlobalActionConfig {
  type: string;
  path: string;
}
export interface ActionPopupConfig {
  title: string;
  text: string;
  type: string;
  acceptButton: string;
  cancelButton: string;
}

export interface ExecutionPayload {
  payload: string;
}

export interface ColumnConfig {
  label: string;
  name: string;
  dataPath: string;
  hidden?: boolean;
  link?: LinkConfig;
  text?: TextConfig;
  status?: StatusConfig;
  tags?: TagConfig;
  textMapping?: Record<string, string>;
  popIn?: boolean;
}

export interface TagConfig {
  sort?: string;
}

export interface StatusConfig {
  mapping: StatusMapping;
  tooltipDataPath?: string;
  tooltipDefaultMessage?: string;
}

export interface StatusMapping {
  critical: string[];
  positive: string[];
  negative: string[];
  informative: string[];
  default: string[];
}

export interface TextConfig {
  style?: string;
}

export interface LinkConfig {
  target: string;
  urlPath?: string;
  url?: string;
}

export interface AccountType {
  id: string;
  defaultAccount?: Account;
  displayName: string;
  description?: string;
  image?: string;
  type: {
    Name: string;
  };
}

export interface Contact {
  displayName: string;
  email?: string;
  roles?: string[];
  contactLink?: string;
}

export type ColorCategory =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10';

export interface Label {
  title: string;
  color: ColorCategory;
}

export interface MarketplaceEntry {
  metadata: {
    name: string;
  };
  spec: {
    installed: boolean;
    apiExport: {
      metadata: string;
      spec: {
        permissionClaims: {
          all: boolean;
          group: string;
          identityHash: string;
          resource: string;
          verbs: string[];
        }[];
      };
    };
    providerMetadata: ProviderMetadata;
  };
}

export interface ProviderMetadata {
  spec: {
    name: string;
    displayName: string;
    tags?: string[];
    description?: string;
    image?: string; // data:image/x;base64,
    category?: string;
    configurationMetadata?: string;
    instance: ServiceInstance | undefined | null;
    isChangingInstallations?: boolean;
    icon?: Icon;
    wizardConfig?: ProviderWizardConfig;
    documentation?: Documentation[];
    helpCenterData?: Documentation[];
    creationTimestamp?: string;
    accountConnections?: AccountConnection[];
    contacts?: Contact[];
    labels?: Label[];
    links?: Link[];
    mainLink?: Link;
    preferredSupportChannels?: Link[];
    provider?: string;
    network?: string;
    verification?: Verification;
    serviceLevel?: ServiceLevel;
    template?: TemplateSpec;
    isMandatory?: boolean;
  };
}

export interface TemplateSpec {
  name: string;
  version: string;
}

export interface Link {
  name: string;
  displayName?: string;
  url: string;
  default?: boolean;
}

export enum ServiceLevel {
  VeryHigh = 'veryHigh24x7',
  High = 'high24x5',
  MediumOne = 'mediumOne16x5',
  MediumTwo = 'mediumTwo12x5',
  Low = 'low8x5',
}

export interface ProviderWizardConfig {
  name: string;
  configData: string;
  wizardDefinition: string;
}

export interface Documentation {
  name: string;
  url?: string;
}

export interface Icon {
  light: Image;
  dark: Image;
}

export interface Image {
  url?: string;
  data?: string;
}

export interface ServiceInstance {
  id: string;
  name: string;
  providerMetadata: ProviderMetadata;
  configurationMetadata?: unknown;
  installationData?: Record<string, string>;
  providerData?: Record<string, string>;
  isMandatory?: boolean;
  creationTimestamp?: Date;
  status: ServiceStatus;
  serviceInstanceStatus?: Record<string, ServiceInstanceStatusValue>;
}

export interface ServiceInstanceStatusValue {
  label: string;
}

export enum ServiceStatus {
  READY = 'READY',
  IN_DELETION = 'IN_DELETION',
}

export interface InstallProviderInput {
  marketPlaceEntry: MarketplaceEntry;
  installationData?: Record<string, unknown>;
}

export interface UpdateProviderInput {
  providerInput: ProviderInput;
  instanceId: string;
  installationData: Record<string, unknown>;
}

export interface ProviderInput {
  id: string;
}

export interface ProviderMetadataFilter {
  installableIn?: string[];
  excludeHiddenExtensions?: boolean;
  excludeHiddenInGlobalCatalogExtensions?: boolean;
}
