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

import { PagerDutyChangeEventsResponse, 
  PagerDutyServiceResponse, 
  PagerDutyUser, 
  PagerDutyIncidentsResponse,
  PagerDutyServiceStandardsResponse,
  PagerDutyServiceMetricsResponse,
  PagerDutyServiceStandards,
  PagerDutyServiceMetrics,
  PagerDutyEntityMappingsResponse
 } from '@pagerduty/backstage-plugin-common';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { PagerDutyEntity } from '../types';

/** @public */
export type PagerDutyTriggerAlarmRequest = {
  integrationKey: string;
  source: string;
  description: string;
  userName: string;
};

/** @public */
export type PagerDutyCardServiceResponse = {
  id: string;
  name: string;
  url: string;
  policyId: string;
  policyLink: string;
  policyName: string;
  status?: string;
  standards?: PagerDutyServiceStandards;
  metrics?: PagerDutyServiceMetrics[];
}

/** @public */
export interface PagerDutyApi {
  /**
   * Fetches all entity mappings.
   *
   */
  getEntityMappings(): Promise<PagerDutyEntityMappingsResponse>;

  /**
   * Stores the service mapping in the database.
   * 
   */
  storeServiceMapping(serviceId: string, integrationKey: string, entityRef: string): Promise<Response>;

  /**
   * Fetches the service for the provided pager duty Entity.
   *
   */
  getServiceByPagerDutyEntity(
    pagerDutyEntity: PagerDutyEntity,
  ): Promise<PagerDutyServiceResponse>;

  /**
   * Fetches the service for the provided Entity.
   *
   */
  getServiceByEntity(entity: Entity): Promise<PagerDutyServiceResponse>;

  /**
   * Fetches service with the provided service id.
   *
   */
  getServiceById(
    serviceId: string,
  ): Promise<PagerDutyServiceResponse>;

  /**
   * Fetches a list of incidents a provided service has.
   *
   */
  getIncidentsByServiceId(
    serviceId: string,
  ): Promise<PagerDutyIncidentsResponse>;

  /**
   * Fetches a list of change events a provided service has.
   *
   */
  getChangeEventsByServiceId(
    serviceId: string,
  ): Promise<PagerDutyChangeEventsResponse>;

  /**
   * Fetches a list of standards for a provided service.
   *
   */
  getServiceStandardsByServiceId(
    serviceId: string,
  ): Promise<PagerDutyServiceStandardsResponse>;

  /**
   * Fetches a list of metrics for a provided service.
   *
   */
  getServiceMetricsByServiceId(
    serviceId: string,
  ): Promise<PagerDutyServiceMetricsResponse>;

  /**
   * Fetches the list of users in an escalation policy.
   *
   */
  getOnCallByPolicyId(policyId: string): Promise<PagerDutyUser[]>;

  /**
   * Triggers an incident to whoever is on-call.
   */
  triggerAlarm(request: PagerDutyTriggerAlarmRequest): Promise<Response>;
}

/** @public */
export type PagerDutyClientApiDependencies = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
};

/** @public */
export type PagerDutyClientApiConfig = PagerDutyClientApiDependencies & {
  eventsBaseUrl?: string;
};

export type RequestOptions = {
  method: string;
  headers: HeadersInit;
  body?: BodyInit;
};
