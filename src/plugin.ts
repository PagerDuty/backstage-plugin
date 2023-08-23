/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { pagerDutyApiRef, PagerDutyClient } from './api';
import {
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
  configApiRef,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home-react';
import { HomePagePagerDutyCardProps } from './components/HomePagePagerDutyCard/Content';

export const rootRouteRef = createRouteRef({
  id: 'pagerduty',
});

/** @public */
export const pagerDutyPlugin = createPlugin({
  id: 'pagerduty',
  apis: [
    createApiFactory({
      api: pagerDutyApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, discoveryApi, fetchApi }) =>
        PagerDutyClient.fromConfig(configApi, { discoveryApi, fetchApi }),
    }),
  ],
});

/** @public */
export const EntityPagerDutyCard = pagerDutyPlugin.provide(
  createComponentExtension({
    name: 'EntityPagerDutyCard',
    component: {
      lazy: () =>
        import('./components/EntityPagerDutyCard').then(
          m => m.EntityPagerDutyCard,
        ),
    },
  }),
);

/** @public */
export const HomePagePagerDutyCard = pagerDutyPlugin.provide(
  createCardExtension<HomePagePagerDutyCardProps>({
    name: 'HomePagePagerDutyCard',
    title: 'PagerDuty Homepage Card',
    components: () => import('./components/HomePagePagerDutyCard'),
    settings: {
      schema: {
        title: 'PagerDuty',
        type: 'object',
        properties: {
          integrationKey: {
            title: 'PagerDuty integration key',
            type: 'string',
          },
          serviceId: {
            title: 'PagerDuty service id',
            type: 'string',
          },
          name: {
            title: 'PagerDuty service name',
            type: 'string',
          },
        },
      },
    },
  }),
);
