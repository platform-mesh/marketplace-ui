export interface PortalContext extends Record<string, string> {
  accountsServiceApiUrl: string; //
  automaticDGraphqlApiUrl: string; //
  extensionManagerServiceApiUrl: string; //
  environment: 'dev' | 'int' | 'prod';
}
