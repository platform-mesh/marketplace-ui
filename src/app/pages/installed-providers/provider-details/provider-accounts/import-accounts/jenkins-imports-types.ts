export interface JenkinsImport {
  name: string;
  imported: boolean;
  projectId: string;
  ownerID: string;
  costCenter: string;
  size: string;
  selectable?: boolean;
  selected?: boolean;
}

export interface JenkinsImportResource {
  apiVersion: string;
  kind: string;
  metadata: JenkinsImportResourceMetadata;
  spec: JenkinsImportResourceSpec;
}

interface JenkinsImportResourceMetadata {
  annotations: Record<string, string>;
  creationTimestamp: string;
  generation: string;
  labels: JenkinsImportResourceLabels;
  managedFields: Record<string, string | object>;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
}

interface JenkinsImportResourceLabels {
  imported: string;
  ownerID: string;
  projectId: string;
}

interface JenkinsImportResourceSpec {
  costcenter: string;
  size: string;
}

export interface FetchJenkinsImportsResult {
  apiVersion: string;
  items: JenkinsImportResource[];
  kind: string;
  metadata: Record<string, string>;
}
