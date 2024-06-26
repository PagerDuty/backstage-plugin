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
import { PagerDutySmallCard } from "../PagerDutySmallCard";
import { NotFoundError } from "@backstage/errors";
import { TestApiRegistry, wrapInTestApp } from "@backstage/test-utils";
import { pagerDutyApiRef, UnauthorizedError, PagerDutyClient } from "../../api";
import {
  PagerDutyService,
  PagerDutyServiceMetrics,
  PagerDutyServiceStandards,
} from "@pagerduty/backstage-plugin-common";

import { alertApiRef } from "@backstage/core-plugin-api";
import { ApiProvider } from "@backstage/core-app-api";

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

const standards: PagerDutyServiceStandards = {
  resource_id: "SERV1CE1D",
  resource_type: "technical_service",
  score: {
    passing: 1,
    total: 1,
  },
  standards: [
    {
      id: "STANDARD1D",
      name: "standard-one",
      description: "standard-one-description",
      active: true,
      pass: true,
      type: "technical_service",
    },
  ],
};

const metrics: PagerDutyServiceMetrics[] = [
  {
    service_id: "SERV1CE1D",
    total_incident_count: 10,
    total_high_urgency_incidents: 5,
    total_interruptions: 5,
  },
];

const mockPagerDutyApi: Partial<PagerDutyClient> = {
  getServiceByEntity: async () => ({ service }),
  getOnCallByPolicyId: async () => [],
  getServiceStandardsByServiceId: async () => ({ standards }),
  getServiceMetricsByServiceId: async () => ({ metrics }),
};

const apis = TestApiRegistry.from(
  [pagerDutyApiRef, mockPagerDutyApi],
  [alertApiRef, {}]
);

describe("PagerDutySmallCard", () => {
  it("Render pagerduty", async () => {
    mockPagerDutyApi.getServiceByPagerDutyEntity = jest
      .fn()
      .mockImplementationOnce(async () => ({ service }));

    const { getByText, queryByTestId } = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <PagerDutySmallCard name="blah" integrationKey="abc123" />
        </ApiProvider>
      )
    );
    await waitFor(() => !queryByTestId("progress"));
    expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
    expect(getByText("Create new incident")).toBeInTheDocument();
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
          <PagerDutySmallCard name="blah" integrationKey="abc123" />
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
          <PagerDutySmallCard name="blah" integrationKey="abc123" />
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
          <PagerDutySmallCard name="blah" integrationKey="abc123" />
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
          <PagerDutySmallCard name="blah" integrationKey="abc123" />
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
            <PagerDutySmallCard name="blah" integrationKey="abc123" />
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(getByText("Create new incident")).toBeInTheDocument();
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
            <PagerDutySmallCard
              name="blah"
              integrationKey="abc123"
              serviceId="def123"
            />
          </ApiProvider>
        )
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
            <PagerDutySmallCard
              name="blah"
              integrationKey="abc123"
              serviceId="def123"
            />
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
            <PagerDutySmallCard
              name="blah"
              integrationKey="abc123"
              serviceId="def123"
            />
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
            <PagerDutySmallCard name="blah" serviceId="def123" />
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
            <PagerDutySmallCard
              name="blah"
              integrationKey="abc123"
              serviceId="def123"
            />
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(getByText("Create new incident")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
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
            <PagerDutySmallCard
              name="blah"
              integrationKey="abc123"
              serviceId="def123"
              readOnly
            />
          </ApiProvider>
        )
      );
      await waitFor(() => !queryByTestId("progress"));
      expect(getByText("Open service in PagerDuty")).toBeInTheDocument();
      expect(
        getByText("No one is on-call. Update the escalation policy.")
      ).toBeInTheDocument();
      expect(() => getByText("Create new incident")).toThrow();
    });
  });
});
