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
// eslint-disable-next-line @backstage/no-undeclared-imports
import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { PAGERDUTY_INTEGRATION_KEY, PAGERDUTY_SERVICE_ID } from '../constants';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getPagerDutyEntity } from '../pagerDutyEntity';
import { PagerDutySmallCard } from '../PagerDutySmallCard';

/** @public */
export const isPluginApplicableToEntity = (entity: Entity) =>
  Boolean(
    entity.metadata.annotations?.[PAGERDUTY_INTEGRATION_KEY] ||
      entity.metadata.annotations?.[PAGERDUTY_SERVICE_ID],
  );

/** @public */
export type EntityPagerDutySmallCardProps = {
  readOnly?: boolean;
  disableInsights?: boolean;
  disableOnCall?: boolean;
};

/** @public */
export const EntityPagerDutySmallCard = (props: EntityPagerDutySmallCardProps) => {
  const { readOnly, disableInsights, disableOnCall } = props;
  const { entity } = useEntity();
  const pagerDutyEntity = getPagerDutyEntity(entity);
  return (
    <PagerDutySmallCard
      {...pagerDutyEntity}
      readOnly={readOnly}
      disableInsights={disableInsights}
      disableOnCall={disableOnCall}
    />
  );
};
