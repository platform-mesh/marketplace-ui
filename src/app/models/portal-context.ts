// todo gkr remove what's not needed env ???
export interface PortalContext extends Record<string, string> {
  crdGatewayApiUrl: string;
  accountsServiceApiUrl: string;
  automaticDGraphqlApiUrl: string;
  environment: 'dev' | 'int' | 'prod';
}
