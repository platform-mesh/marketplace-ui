export interface PortalContext extends Record<string, string> {
  crdGatewayApiUrl: string;
  accountsServiceApiUrl: string;
  environment: 'dev' | 'int' | 'prod';
}
