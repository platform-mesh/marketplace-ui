# DXP Package Manager Frontend

## Local Development Setup

Terminal:

Common repository token required. Store your token in `.secret/common-repo` file.

```bash
COMMON_REPOSITORY_TOKEN=$(cat .secret/common-repo) npm i
npm run start
```

Open Browser:

https://portal.d1.hyperspace.tools.sap/catalog

We have to serve two content-configurations - `content-configuration.json` and `content-configuration-global.json` for this microfrontend, therefore you need to use them in the
[local setup](https://portal.hyperspace.tools.sap/projects/dxp/documentation/Extend-&-Contribute/Before-you-Begin/Local-setup).

For more information see [here](https://portal.hyperspace.tools.sap/projects/dxp/components/docs-core-team/documentation/Development/Frontend-Development-Hints.

### Local Development for Accounts

To develop locally using an account configuration (e.g., jira), you need to:

1. Add a new entry to the `content-configuration.json` file.
2. Replace `jira` with the appropriate account type. You can find the account type by navigating to any project and checking the URL in the `Settings & Accounts` section.
3. Modify the `pathSegment` to a local path.
4. Modify the `url` to point to the local path segment.

```json
        {
          "pathSegment": "jira-local",
          "label": "Jira - Local",
          "entityType": "project",
          "url": "http://localhost:4200/#/configurations/jira-local",
          "visibleForContext": "contains(entityContext.project.policies, 'iamMember')",
          "category": {
            "id": "settings::configurations",
            "label": "jira"
          },
          "context": {
            "extClassName": "jira"
          }
        }
```

### Updating GraphQL Schemas

The application uses GraphQL schemas from two endpoints that need to be merged:
- **Marketplace Virtual Workspace**: Contains marketplace-specific types (MarketplaceEntry, etc.)
- **Workspace**: Contains Kubernetes API types (APIBinding, etc.)

To update the schemas:

1. Install the required dependencies (if not already installed):
   ```bash
   npm install -D @graphql-tools/merge @graphql-tools/load @graphql-tools/graphql-file-loader
   ```

2. Run the fetch script with a valid bearer token:
   ```bash
   ./scripts/fetch-schemas.sh <your-bearer-token>
   ```

This will fetch both schemas and merge them into `schemas/schema.graphql`.
