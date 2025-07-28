import { createAction, props } from '@ngrx/store';
import { ProviderMetadata } from 'models/provider-metadata';

export const unInstallExtension = createAction(
  '[Extension Instances] Uninstall extension',
  props<{
    extensionInstanceName: string;
    extension: ProviderMetadata;
  }>(),
);

export const uninstalledExtensionSuccessfully = createAction(
  '[Extension Instances] extension uninstalled successfully',
  props<{ extension: ProviderMetadata }>(),
);
