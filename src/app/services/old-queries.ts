// import { gql } from 'apollo-angular';
//
// const extensionClassForScopeQuery = gql`
//   query getExtensionClassForScope(
//     $tenantId: String!
//     $type: ScopeType!
//     $context: ScopeContext!
//     $providerName: String!
//     $filter: ExtensionClassFilter
//   ) {
//     getExtensionClassForScope(
//       tenantId: $tenantId
//       type: $type
//       context: $context
//       providerName: $providerName
//       filter: $filter
//     ) {
//       name
//       creationTimestamp
//       category
//       contacts {
//         displayName
//         email
//         role
//         contactLink
//       }
//       labels {
//         title
//       }
//       displayName
//       description
//       image
//       configurationMetadata
//       extensionConfig
//       provider
//       scope {
//         type
//       }
//       instances {
//         id
//         name
//         installationData
//         providerData
//         isMandatoryExtension
//         extensionClass {
//           name
//           category
//           displayName
//           image
//           icon {
//             light {
//               url
//               data
//             }
//             dark {
//               url
//               data
//             }
//           }
//           scope {
//             type
//           }
//           provider
//         }
//         status
//         scope {
//           type
//         }
//         extensionStatus
//       }
//       installable
//       wizardConfig {
//         name
//         configData
//         wizardDefinition
//       }
//       documentation {
//         url
//       }
//       accountConnections {
//         description
//         displayName
//         name
//         image {
//           url
//         }
//         type {
//           context
//           name
//           apiResourceConfig {
//             wizardConfig {
//               name
//               configData
//               wizardDefinition
//             }
//             displayConfig {
//               apiServerConfig {
//                 host
//                 namespaceRetrievalStrategy
//               }
//               resourceConfig {
//                 groupVersion
//                 kind
//               }
//               tableConfig {
//                 columns {
//                   name
//                   label
//                   dataPath
//                   hidden
//                   textMapping
//                   popIn
//                   link {
//                     target
//                     urlPath
//                     url
//                   }
//                   text {
//                     style
//                   }
//                   status {
//                     mapping {
//                       critical
//                       positive
//                       negative
//                       informative
//                       default
//                     }
//                     tooltipDataPath
//                     tooltipDefaultMessage
//                   }
//                   tags {
//                     sort
//                   }
//                 }
//                 actions {
//                   additionalActions {
//                     id
//                     glyph
//                     displayName
//                     condition
//                     executionPayload {
//                       payload
//                     }
//                     actionSuccessMessage
//                     confirmationPopup {
//                       title
//                       text
//                       type
//                       acceptButton
//                       cancelButton
//                     }
//                     requiredPolicies
//                   }
//                   globalActions {
//                     id
//                     glyph
//                     displayName
//                     condition
//                     actionConfig {
//                       type
//                       path
//                     }
//                     requiredPolicies
//                   }
//                 }
//                 messageStrip {
//                   type
//                   text
//                   noIcon
//                   dismissible
//                 }
//               }
//               accountAssignmentConfig {
//                 nameDataPath
//                 addAccountTitle
//                 noAccountsFoundTitle
//               }
//               accountNamingConfig {
//                 singular
//                 plural
//               }
//             }
//           }
//         }
//       }
//       icon {
//         light {
//           url
//           data
//         }
//         dark {
//           url
//           data
//         }
//       }
//       links {
//         displayName
//         URL
//       }
//       mainLink {
//         URL
//         displayName
//       }
//       network
//       preferredSupportChannels {
//         URL
//         displayName
//       }
//       serviceLevel
//       template {
//         name
//         version
//       }
//       verification {
//         type
//       }
//     }
//   }
// `;
//
// /*
// const extensionClassesForScopesQuery = gql`
//   query getExtensionClassesForScopes(
//     $tenantId: String!
//     $types: [ScopeType]!
//     $context: ScopeContext!
//     $filter: ExtensionClassFilter
//   ) {
//     getExtensionClassesForScopes(
//       tenantId: $tenantId
//       types: $types
//       context: $context
//       filter: $filter
//     ) {
//       name
//       displayName
//       description
//       image
//       configurationMetadata
//       creationTimestamp
//       category
//       provider
//       contacts {
//         displayName
//         email
//         role
//         contactLink
//       }
//       labels {
//         title
//       }
//       links {
//         displayName
//         URL
//       }
//       mainLink {
//         URL
//         displayName
//       }
//       network
//       preferredSupportChannels {
//         URL
//         displayName
//       }
//       serviceLevel
//       extensionConfig
//       scope {
//         type
//       }
//       instances {
//         id
//         name
//         creationTimestamp
//         installationData
//         providerData
//         isMandatoryExtension
//         extensionClass {
//           name
//           category
//           displayName
//           image
//           icon {
//             light {
//               url
//               data
//             }
//             dark {
//               url
//               data
//             }
//           }
//           scope {
//             type
//           }
//           provider
//         }
//         status
//         scope {
//           type
//         }
//         extensionStatus
//       }
//       installable
//       wizardConfig {
//         name
//         configData
//         wizardDefinition
//       }
//       documentation {
//         url
//       }
//       accountConnections {
//         description
//         displayName
//         name
//         image {
//           url
//         }
//         type {
//           context
//           name
//           apiResourceConfig {
//             wizardConfig {
//               name
//               configData
//               wizardDefinition
//             }
//             displayConfig {
//               apiServerConfig {
//                 host
//                 namespaceRetrievalStrategy
//               }
//               resourceConfig {
//                 groupVersion
//                 kind
//               }
//               tableConfig {
//                 columns {
//                   name
//                   label
//                   dataPath
//                   hidden
//                   textMapping
//                   popIn
//                   link {
//                     target
//                     urlPath
//                     url
//                   }
//                   text {
//                     style
//                   }
//                   status {
//                     mapping {
//                       critical
//                       positive
//                       negative
//                       informative
//                       default
//                     }
//                     tooltipDataPath
//                     tooltipDefaultMessage
//                   }
//                   tags {
//                     sort
//                   }
//                 }
//                 actions {
//                   additionalActions {
//                     id
//                     glyph
//                     displayName
//                     condition
//                     executionPayload {
//                       payload
//                     }
//                     actionSuccessMessage
//                     confirmationPopup {
//                       title
//                       text
//                       type
//                       acceptButton
//                       cancelButton
//                     }
//                     requiredPolicies
//                   }
//                   globalActions {
//                     id
//                     glyph
//                     displayName
//                     condition
//                     actionConfig {
//                       type
//                       path
//                     }
//                     requiredPolicies
//                   }
//                 }
//                 messageStrip {
//                   type
//                   text
//                   noIcon
//                   dismissible
//                 }
//               }
//               accountAssignmentConfig {
//                 nameDataPath
//                 addAccountTitle
//                 noAccountsFoundTitle
//               }
//               accountNamingConfig {
//                 singular
//                 plural
//               }
//             }
//           }
//         }
//       }
//       icon {
//         light {
//           url
//           data
//         }
//         dark {
//           url
//           data
//         }
//       }
//       template {
//         name
//         version
//       }
//       verification {
//         type
//       }
//     }
//   }
// `;
//
// */
//
// const UNINSTALL_EXTENSION = gql`
//   mutation uninstallExtension(
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $name: String!
//   ) {
//     uninstallExtension(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       name: $name
//     )
//   }
// `;
//
// const INSTALL_EXTENSION = gql`
//   mutation installExtension(
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $input: InstallExtensionInput!
//   ) {
//     installExtension(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       input: $input
//     ) {
//       id
//       name
//     }
//   }
// `;
//
// const UPDATE_EXTENSION_INSTANCE = gql`
//   mutation updateExtensionInstanceInProject(
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $input: UpdateExtensionInput!
//   ) {
//     updateExtension(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       input: $input
//     )
//   }
// `;
//
// const ACCOUNT_CONNECTIONS = gql`
//   query (
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $accountConnectionTypes: [String!]
//   ) {
//     accountConnectionsForScope(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       accountConnectionTypes: $accountConnectionTypes
//     ) {
//       id
//       name
//       displayName
//       type {
//         id
//         defaultAccount {
//           id
//           displayName
//         }
//         displayName
//         description
//         image
//         type {
//           Name
//         }
//       }
//       subType
//       link
//     }
//   }
// `;
//
// const DELETE_ACCOUNT_CONNECTION = gql`
//   mutation deleteAccountConnectionForScope(
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $id: String!
//   ) {
//     deleteAccountConnectionForScope(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       id: $id
//     )
//   }
// `;
//
// const SET_DEFAULT_ACCOUNT = gql`
//   mutation setDefaultAccount(
//     $tenantId: String!
//     $scope: String!
//     $entity: String!
//     $accountName: String!
//   ) {
//     setDefaultAccount(
//       tenantId: $tenantId
//       scope: $scope
//       entity: $entity
//       accountName: $accountName
//     )
//   }
// `;
