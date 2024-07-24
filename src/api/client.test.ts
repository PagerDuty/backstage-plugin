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
import { MockFetchApi } from '@backstage/test-utils';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { PagerDutyClient, UnauthorizedError } from './client';
import { PagerDutyService, PagerDutySetting } from '@pagerduty/backstage-plugin-common';
import { NotFoundError } from '@backstage/errors';
import { Entity } from '@backstage/catalog-model';

const mockFetch = jest.fn().mockName('fetch');
const mockDiscoveryApi: jest.Mocked<DiscoveryApi> = {
  getBaseUrl: jest
    .fn()
    .mockName('discoveryApi')
    .mockResolvedValue('http://localhost:7007/pagerduty'),
};
const mockFetchApi: MockFetchApi = new MockFetchApi({
  baseImplementation: mockFetch,
});

let client: PagerDutyClient;
let entity: Entity;

const service: PagerDutyService = {
  id: "SERV1CE1D",
  name: "service-one",
  html_url: "www.example.com",
  escalation_policy: {
    id: "ESCALAT1ONP01ICY1D",
    name: "ep-one",
    html_url: "http://www.example.com/escalation-policy/ESCALAT1ONP01ICY1D",
  },
};

const requestHeaders = {
  headers: {
    Accept: 'application/vnd.pagerduty+json;version=2',
    'Content-Type': 'application/json',
  },
  method: 'GET',
};

describe('PagerDutyClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();

    client = new PagerDutyClient({
      eventsBaseUrl: 'https://events.pagerduty.com/v2',
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
    });
  });

  describe('getServiceByEntity', () => {
    describe('when provided entity has an integrationKey value', () => {
      beforeEach(() => {
        entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'pagerduty-test',
            annotations: {
              'pagerduty.com/integration-key': 'abc123',
            },
          },
        };
      });

      it('queries proxy path by integration id', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ service }),
        });

        expect(await client.getServiceByEntity(entity)).toEqual({
          service,
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:7007/pagerduty/services?integration_key=abc123',
          requestHeaders,
        );
      });

      describe('on 401 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws UnauthorizedError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            UnauthorizedError,
          );
        });
      });

      describe('on 404 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 404,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            NotFoundError,
          );
        });
      });

      describe('on other non-ok response', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 500,
            ok: false,
            json: () =>
              Promise.resolve({
                errors: ['Not valid request', 'internal error occurred'],
              }),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            'Request failed with 500, Not valid request internal error occurred',
          );
        });
      });

      describe('when services response is empty', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: () => Promise.resolve({ }),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            NotFoundError,
          );
        });
      });
    });

    describe('when provided entity has a serviceId value', () => {
      beforeEach(() => {
        entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'pagerduty-test',
            annotations: {
              'pagerduty.com/service-id': 'SERVICE1D',
            },
          },
        };
      });

      it('queries proxy path by integration id', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ service }),
        });

        expect(await client.getServiceByEntity(entity)).toEqual({
          service,
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:7007/pagerduty/services/SERVICE1D',
          requestHeaders,
        );
      });

      describe('on 401 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws UnauthorizedError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            UnauthorizedError,
          );
        });
      });

      describe('on 404 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 404,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            NotFoundError,
          );
        });
      });

      describe('on other non-ok response', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 500,
            ok: false,
            json: () =>
              Promise.resolve({
                errors: ['Not valid request', 'internal error occurred'],
              }),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            'Request failed with 500, Not valid request internal error occurred',
          );
        });
      });
    });

    describe('when provided entity has both integrationKey and serviceId', () => {
      beforeEach(() => {
        entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'pagerduty-test',
            annotations: {
              'pagerduty.com/integration-key': 'abc123',
              'pagerduty.com/service-id': 'def456',
            },
          },
        };
      });

      it('queries pagerduty path by integration id', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ service }),
        });

        expect(await client.getServiceByEntity(entity)).toEqual({
          service,
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:7007/pagerduty/services?integration_key=abc123',
          requestHeaders,
        );
      });

      describe('on 401 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws UnauthorizedError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            UnauthorizedError,
          );
        });
      });

      describe('on 404 response code', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 404,
            ok: false,
            json: () => Promise.resolve({}),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            NotFoundError,
          );
        });
      });

      describe('on other non-ok response', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 500,
            ok: false,
            json: () =>
              Promise.resolve({
                errors: ['Not valid request', 'internal error occurred'],
              }),
          });
        });

        it('throws a corresponding error', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            'Request failed with 500, Not valid request internal error occurred',
          );
        });
      });

      describe('when services response is empty', () => {
        beforeEach(() => {
          mockFetch.mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: () => Promise.resolve({ }),
          });
        });

        it('throws NotFoundError', async () => {
          await expect(client.getServiceByEntity(entity)).rejects.toThrow(
            NotFoundError,
          );
        });
      });
    });

    describe('when provided entity has no integrationKey or serviceId values', () => {
      beforeEach(() => {
        entity = {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'pagerduty-test',
            annotations: {},
          },
        };
      });

      it('throws NotFoundError', async () => {
        await expect(client.getServiceByEntity(entity)).rejects.toThrow(
          NotFoundError,
        );
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });
});
describe('getSetting', () => {
  const settingId = 'settingId';
  const setting: PagerDutySetting = {
    id: settingId,
    value: 'disabled',
  };

  beforeEach(() => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve(setting),
    });
  });

  it('should fetch the setting by ID', async () => {
    const result = await client.getSetting(settingId);

    expect(result).toEqual(setting);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7007/pagerduty/settings/settingId',
      requestHeaders,
    );
  });

  describe('storeSettings', () => {
    const settings: PagerDutySetting[] = [
      {
        id: 'setting1',
        value: 'disabled',
      },
      {
        id: 'setting2',
        value: 'backstage',
      },
    ];

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should send a POST request to the correct URL with the settings', async () => {
      const response = new Response(null, { status: 200 });
      mockFetch.mockResolvedValueOnce(response);

      const expectedUrl = 'http://localhost:7007/pagerduty/settings';
      const expectedOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(settings),
      };

      await expect(client.storeSettings(settings)).resolves.toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expectedOptions);
    });

    it('should throw an error if the request fails', async () => {
      const errorResponse = {
        status: 500,
        ok: false,
        json: () =>
          Promise.resolve({
            errors: ['Internal server error'],
          }),
      };
      mockFetch.mockResolvedValueOnce(errorResponse);

      await expect(client.storeSettings(settings)).rejects.toThrow(
        'Request failed with 500, Internal server error',
      );
    });
  });

});