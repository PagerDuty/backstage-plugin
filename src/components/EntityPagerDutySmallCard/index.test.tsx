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
import React from "react";
import { render, waitFor, fireEvent, act } from "@testing-library/react";
import {
  EntityPagerDutyCard,
  isPluginApplicableToEntity,
} from "../EntityPagerDutyCard";
import { Entity } from "@backstage/catalog-model";
import { EntityProvider } from "@backstage/plugin-catalog-react";
import { NotFoundError } from "@backstage/errors";
import { TestApiRegistry, wrapInTestApp } from "@backstage/test-utils";
import { pagerDutyApiRef, UnauthorizedError, PagerDutyClient } from "../../api";
import {
  PagerDutyUser,
  PagerDutyService,
  PagerDutyServiceStandards,
  PagerDutyServiceMetrics,
} from "@pagerduty/backstage-plugin-common";

import { alertApiRef } from "@backstage/core-plugin-api";
import { ApiProvider } from "@backstage/core-app-api";

const entity: Entity = {
  apiVersion: "backstage.io/v1alpha1",
  kind: "Component",
  metadata: {
    name: "pagerduty-test",
    annotations: {
      "pagerduty.com/integration-key": "abc123",
    },
  },
};

const entityWithoutAnnotations: Entity = {
  apiVersion: "backstage.io/v1alpha1",
  kind: "Component",
  metadata: {
    name: "pagerduty-test",
    annotations: {},
  },
};

const entityWithServiceId: Entity = {
  apiVersion: "backstage.io/v1alpha1",
  kind: "Component",
  metadata: {
    name: "pagerduty-test",
    annotations: {
      "pagerduty.com/service-id": "def456",
    },
  },
};

const entityWithAllAnnotations: Entity = {
  apiVersion: "backstage.io/v1alpha1",
  kind: "Component",
  metadata: {
    name: "pagerduty-test",
    annotations: {
      "pagerduty.com/integration-key": "abc123",
      "pagerduty.com/service-id": "def456",
    },
  },
};

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

const oncallUsers: PagerDutyUser[] = [];

const standards: PagerDutyServiceStandards = {
  resource_id: "RES0URCE1D",
  resource_type: "technical_service",
  score: {
    passing: 1,
    total: 1,
  },
  standards: [
    {
      active: true,
      description: "Standard description",
      id: "STANDARD1D",
      name: "Standard name",
      pass: true,
      type: "technical_service_standard",
    },
  ],
};

const metrics: PagerDutyServiceMetrics[] = [
  {
    service_id: "SERV1CE1D",
    total_high_urgency_incidents: 5,
    total_incident_count: 12,
    total_interruptions: 3,
  },
];

const mockPagerDutyApi: Partial<PagerDutyClient> = {
  getServiceByEntity: async () => ({ service }),
  getServiceByPagerDutyEntity: async () => ({ service }),
  getOnCallByPolicyId: async () => oncallUsers,
  getIncidentsByServiceId: async () => ({ incidents: [] }),
  getServiceStandardsByServiceId: async () => ({ standards }),
  getServiceMetricsByServiceId: async () => ({ metrics }),
};

const apis = TestApiRegistry.from(
  [pagerDutyApiRef, mockPagerDutyApi],
  [alertApiRef, {}]
);

describe("isPluginApplicableToEntity", () => {
  describe("when entity has no annotations", () => {
    it("returns false", () => {
      expect(isPluginApplicableToEntity(entityWithoutAnnotations)).toBe(false);
    });
  });

  describe("when entity has the pagerduty.com/integration-key annotation", () => {
    it("returns true", () => {
      expect(isPluginApplicableToEntity(entity)).toBe(true);
    });
  });

  describe("when entity has the pagerduty.com/service-id annotation", () => {
    it("returns true", () => {
      expect(isPluginApplicableToEntity(entityWithServiceId)).toBe(true);
    });
  });

  describe("when entity has all annotations", () => {
    it("returns true", () => {
      expect(isPluginApplicableToEntity(entityWithAllAnnotations)).toBe(true);
    });
  });
});

describe("EntityPagerDutyCard", () => {
  it("Render pagerduty", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockImplementationOnce(async () => ({ service }));

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <EntityProvider entity={entity}>
            <EntityPagerDutyCard />
          </EntityProvider>
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));
    expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
    expect(getByText("Create new incident")).toBeInTheDocument();
    expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
    expect(
      getByText("No one is on-call. Update the escalation policy.")
    ).toBeInTheDocument();
  });

  it("Handles custom error for missing token", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockRejectedValueOnce(new UnauthorizedError());

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <EntityProvider entity={entity}>
            <EntityPagerDutyCard />
          </EntityProvider>
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));
    expect(getByText("Missing or invalid PagerDuty Token")).toBeInTheDocument();
  });

  it("Handles custom NotFoundError", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockRejectedValueOnce(new NotFoundError());

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <EntityProvider entity={entity}>
            <EntityPagerDutyCard />
          </EntityProvider>
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));
    expect(getByText("PagerDuty Service Not Found")).toBeInTheDocument();
  });

  it("handles general error", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockRejectedValueOnce(new Error("An error occurred"));
    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <EntityProvider entity={entity}>
            <EntityPagerDutyCard />
          </EntityProvider>
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));

    expect(
      getByText(
        "You don't have the required permissions to perform this action. See README for more details."
      )
    ).toBeInTheDocument();
  });

  it("opens the dialog when trigger button is clicked", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockImplementationOnce(async () => ({ service }));

    const { getByText, queryByTestId, getByRole } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <EntityProvider entity={entity}>
            <EntityPagerDutyCard />
          </EntityProvider>
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));
    expect(getByText("Open service in PagerDuty")).toBeInTheDocument();

    const triggerLink = getByText("Create new incident");
    await act(async () => {
      fireEvent.click(triggerLink);
    });
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  describe("when entity has the pagerduty.com/service-id annotation", () => {
    it("Renders PagerDuty service information", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithServiceId}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(queryByTestId("trigger-incident-button")).not.toBeInTheDocument();
      expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
    });

    it("Handles custom error for missing token", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockRejectedValueOnce(new UnauthorizedError());

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithServiceId}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>,
        ),
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(
        getByText("Missing or invalid PagerDuty Token")
      ).toBeInTheDocument();
    });

    it("Handles custom NotFoundError", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockRejectedValueOnce(new NotFoundError());

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithServiceId}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>,
        ),
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("PagerDuty Service Not Found")).toBeInTheDocument();
    });

    it("handles general error", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockRejectedValueOnce(new Error("An error occurred"));
      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithServiceId}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));

      expect(
        getByText(
          "You don't have the required permissions to perform this action. See README for more details."
        )
      ).toBeInTheDocument();
    });

    it("hides the Create new incident button", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithServiceId}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(queryByTestId("trigger-incident-button")).not.toBeInTheDocument();
    });
  });

  describe("when entity has all annotations", () => {
    it("queries by integration key", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithAllAnnotations}>
              <EntityPagerDutyCard />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(getByText("Create new incident")).toBeInTheDocument();
      expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
    });
  });

  describe("when entity has all annotations but the plugin has been configured to disable change events", () => {
    it("must hide change events tab", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithAllAnnotations}>
              <EntityPagerDutyCard disableChangeEvents />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(queryByTestId("change-events")).not.toBeInTheDocument();
      expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
    });
  });

  describe("when entity has all annotations but the plugin has been configured to disable on-call", () => {
    it("must hide on-call component", async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithAllAnnotations}>
              <EntityPagerDutyCard disableOnCall />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(getByText("Change Events")).toBeInTheDocument();
      expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
      expect(queryByTestId("oncall-card")).not.toBeInTheDocument();
    });
  });

  describe('when entity has all annotations but the plugin has been configured to be "read only"', () => {
    it('queries by integration key but does not render the "Create new incident" button', async () => {
      mockPagerDutyApi.getServiceByPagerDutyEntity = jest
        .fn()
        .mockImplementationOnce(async () => ({ service }));

      const { getByText, queryByTestId } = render(
        wrapInTestApp(
          <ApiProvider apis={apis}>
            <EntityProvider entity={entityWithAllAnnotations}>
              <EntityPagerDutyCard readOnly />
            </EntityProvider>
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(getByText("Nice! No incidents found!")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
      expect(() => getByText("Create new incident")).toThrow();
    });
  });
});
