import { ProviderMetadata, ScopeType } from 'models/provider-metadata';
import { VerificationType } from 'models/verification-type';

export const exts: ProviderMetadata[] = [
  {
    scope: { type: ScopeType.GLOBAL },
    instance: null,
    name: 'acme-example-provider',
    tags: ['infra', 'eu'],
    description: 'This is the acme example provider corp.',
    displayName: 'ACME Example Provider corp',
    category: 'Software',
    provider: 'Platform Mesh',
    verification: { type: VerificationType.PlatformMesh },
    icon: {
      dark: {
        url: 'https://myimage.com/image.png',
      },
      light: {
        data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMTRfMTEwNikiPgo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0id2hpdGUiLz4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNDUuMzY0IDIxOS40MTNDMTQ1LjMyMyAyNDAuOTczIDE2Mi40ODggMjU0LjU3IDE4My4xNiAyNDkuMzUzTDIyMi41MjQgMjM5LjQyTDIyMC40MDUgMjMwLjgxN0wxODEuMDQxIDI0MC43NUMxNjUuOTAzIDI0NC41NyAxNTQuMDk1IDIzNS4yMTYgMTU0LjEyNSAyMTkuNDNMMTU0LjQyNSA2MS4zMzc4TDE0NS42NjQgNjEuMzIwOEwxNDUuMzY0IDIxOS40MTNaIiBmaWxsPSIjNEE0QTRBIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTkzLjIzNSAyMzEuNDI5QzE5My4yMzUgMjE1LjY0OSAyMDUuODc0IDIwMi44NTcgMjIxLjQ2NSAyMDIuODU3QzIzNy4wNTYgMjAyLjg1NyAyNDkuNjk1IDIxNS42NDkgMjQ5LjY5NSAyMzEuNDI5QzI0OS42OTUgMjQ3LjIwOCAyMzcuMDU2IDI2MCAyMjEuNDY1IDI2MEMyMDUuODc0IDI2MCAxOTMuMjM1IDI0Ny4yMDggMTkzLjIzNSAyMzEuNDI5WiIgZmlsbD0iI0ZCQkEwMCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MC4wNDUgOTcuMTQyOEMxMzQuNDU0IDk3LjE0MjggMTIxLjgxNSA4NC4zNTEgMTIxLjgxNSA2OC41NzE0QzEyMS44MTUgNTIuNzkxOCAxMzQuNDU0IDQwIDE1MC4wNDUgNDBDMTY1LjYzNiA0MCAxNzguMjc1IDUyLjc5MTggMTc4LjI3NSA2OC41NzE0QzE3OC4yNzUgODQuMzUxIDE2NS42MzYgOTcuMTQyOCAxNTAuMDQ1IDk3LjE0MjhaIiBmaWxsPSIjMDA5M0M2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIxLjc3IDE1My42NjhDMjA2LjE3OSAxNTMuNjY4IDE5My41NCAxNDAuODc2IDE5My41NCAxMjUuMDk3QzE5My41NCAxMDkuMzE3IDIwNi4xNzkgOTYuNTI1MSAyMjEuNzcgOTYuNTI1MUMyMzcuMzYxIDk2LjUyNTEgMjUwIDEwOS4zMTcgMjUwIDEyNS4wOTdDMjUwIDE0MC44NzYgMjM3LjM2MSAxNTMuNjY4IDIyMS43NyAxNTMuNjY4WiIgZmlsbD0iIzRBNEE0QSIvPgo8cGF0aCBkPSJNMjE4LjEwNyAxMzAuNTlMMjE1Ljk4OCAxMjEuOTg3TDgxLjg2NDMgMTU1LjgzMkw4My45ODM3IDE2NC40MzVMMjE4LjEwNyAxMzAuNTlaIiBmaWxsPSIjNEE0QTRBIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzguMjMgMTkwLjAxM0M2Mi42MzkgMTkwLjAxMyA1MCAxNzcuMjIyIDUwIDE2MS40NDJDNTAgMTQ1LjY2MiA2Mi42MzkgMTMyLjg3MSA3OC4yMyAxMzIuODcxQzkzLjgyMSAxMzIuODcxIDEwNi40NiAxNDUuNjYyIDEwNi40NiAxNjEuNDQyQzEwNi40NiAxNzcuMjIyIDkzLjgyMSAxOTAuMDEzIDc4LjIzIDE5MC4wMTNaIiBmaWxsPSIjRjA1MDUzIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTE0XzExMDYiPgo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K',
      },
    },
    contacts: [
      {
        displayName: 'John Doe',
        email: 'jd@acme.corp',
        roles: ['support', 'sales'],
        contactLink: 'https://acme.corp/contact/jd',
      },
    ],
    documentation: [
      {
        name: 'API Documentation',
        url: 'https://acme.corp/docs',
      },
      {
        name: 'End User Documentation',
        url: 'https://acme.corp/end-user-docs',
      },
    ],
    links: [
      {
        name: 'Website',
        url: 'https://acme.corp',
        default: true,
      },
      {
        name: 'Wiki',
        url: 'https://acme.corp/wiki',
      },
    ],
    preferredSupportChannels: [
      {
        name: 'Support',
        url: 'https://acme.corp/support',
      },
    ],
    helpCenterData: [
      {
        name: 'Issue Tracker',
        url: 'https://acme.corp/issues',
      },
      {
        name: 'Feedback Tracker',
        url: 'https://acme.corp/feedback',
      },
    ],
  },
];
