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
import React, { ReactNode, useCallback, useState } from "react";
import {
  Card,
  CardHeader,
  Divider,
  CardContent,
  Grid,
  Typography,
} from "@material-ui/core";
import { Incidents } from "../Incident";
import { EscalationPolicy } from "../Escalation";
import useAsync from "react-use/lib/useAsync";
import { pagerDutyApiRef, UnauthorizedError } from "../../api";
import { MissingTokenError, ServiceNotFoundError } from "../Errors";
import { ChangeEvents } from "../ChangeEvents";
import PDGreenImage from "../../assets/PD-Green.svg";
import PDWhiteImage from "../../assets/PD-White.svg";

import { useApi } from "@backstage/core-plugin-api";
import { NotFoundError } from "@backstage/errors";
import {
  Progress,
  TabbedCard,
  CardTab,
  InfoCard,
} from "@backstage/core-components";
import { PagerDutyEntity } from "../../types";
import { ForbiddenError } from "../Errors/ForbiddenError";
import {
  InsightsCard,
  OpenServiceButton,
  ServiceStandardsCard,
  StatusCard,
  TriggerIncidentButton
} from "../PagerDutyCardCommon";
import { createStyles, makeStyles, useTheme } from "@material-ui/core/styles";
import { BackstageTheme } from "@backstage/theme";
import { PagerDutyCardServiceResponse } from "../../api/types";

const useStyles = makeStyles<BackstageTheme>((theme) =>
  createStyles({
    overviewHeaderTextStyle: {
      fontSize: "14px",
      fontWeight: 500,
      color:
        theme.palette.type === "light"
          ? "rgba(0, 0, 0, 0.54)"
          : "rgba(255, 255, 255, 0.7)",
    },
    oncallHeaderTextStyle: {
      fontSize: "14px",
      fontWeight: 500,
      marginTop: "10px",
      color:
        theme.palette.type === "light"
          ? "rgba(0, 0, 0, 0.54)"
          : "rgba(255, 255, 255, 0.7)",
    },
    headerStyle: {
      marginBottom: "0px",
      fontSize: "0px",
    },
    overviewHeaderContainerStyle: {
      display: "flex",
      margin: "15px",
      marginBottom: "20px",
    },
    headerWithSubheaderContainerStyle: {
      display: "flex",
      alignItems: "center",
    },
    subheaderTextStyle: {
      fontSize: "10px",
      marginLeft: "5px",
    },
    overviewCardsContainerStyle: {
      display: "flex",
      margin: "15px",
      marginTop: "-15px",
    },
    incidentMetricsContainerStyle: {
      display: "flex",
      height: "100%",
      justifyContent: "center",
      columnSpan: "all",
    },
  })
);

const BasicCard = ({ children }: { children: ReactNode }) => (
  <InfoCard title="PagerDuty">{children}</InfoCard>
);

/** @public */
export type PagerDutyCardProps = PagerDutyEntity & {
  readOnly?: boolean;
  disableChangeEvents?: boolean;
  disableOnCall?: boolean;
};

/** @public */
export const PagerDutyCard = (props: PagerDutyCardProps) => {
  const classes = useStyles();

  const theme = useTheme();
  const { readOnly, disableChangeEvents, disableOnCall } = props;
  const api = useApi(pagerDutyApiRef);
  const [refreshIncidents, setRefreshIncidents] = useState<boolean>(false);
  const [refreshChangeEvents, setRefreshChangeEvents] =
    useState<boolean>(false);
  const [refreshStatus, setRefreshStatus] = useState<boolean>(false);

  const handleRefresh = useCallback(() => {
    setRefreshIncidents((x) => !x);
    setRefreshChangeEvents((x) => !x);
    setRefreshStatus((x) => !x);
  }, []);

  const {
    value: service,
    loading,
    error,
  } = useAsync(async () => {
    const { service: foundService } = await api.getServiceByPagerDutyEntity(
      props
    );

    const serviceStandards = await api.getServiceStandardsByServiceId(
      foundService.id
    );

    const serviceMetrics = await api.getServiceMetricsByServiceId(
      foundService.id
    );

    const result: PagerDutyCardServiceResponse = {
      id: foundService.id,
      name: foundService.name,
      url: foundService.html_url,
      policyId: foundService.escalation_policy.id,
      policyLink: foundService.escalation_policy.html_url as string,
      policyName: foundService.escalation_policy.name,
      status: foundService.status,
      standards:
        serviceStandards !== undefined ? serviceStandards.standards : undefined,
      metrics:
        serviceMetrics !== undefined ? serviceMetrics.metrics : undefined,
    };

    return result;
  }, [props]);

  if (error) {
    let errorNode: ReactNode;

    switch (error.constructor) {
      case UnauthorizedError:
        errorNode = <MissingTokenError />;
        break;
      case NotFoundError:
        errorNode = <ServiceNotFoundError />;
        break;
      default:
        errorNode = <ForbiddenError />;
    }

    return <BasicCard>{errorNode}</BasicCard>;
  }

  if (loading) {
    return (
      <BasicCard>
        <Progress />
      </BasicCard>
    );
  }

  return (
    <Card data-testid="pagerduty-card">
      <CardHeader
        className={classes.headerStyle}
        title={
          theme.palette.type === "dark" ? (
            <img src={PDWhiteImage} alt="PagerDuty" height="35" />
          ) : (
            <img src={PDGreenImage} alt="PagerDuty" height="35" />
          )
        }
        action={
          !readOnly && props.integrationKey ? (
            <div>
              <TriggerIncidentButton
                data-testid="trigger-incident-button"
                integrationKey={props.integrationKey}
                entityName={props.name}
                handleRefresh={handleRefresh}
              />
              <OpenServiceButton serviceUrl={service!.url} />
            </div>
          ) : (
            <OpenServiceButton serviceUrl={service!.url} />
          )
        }
      />
      <Grid item md={12} className={classes.overviewHeaderContainerStyle}>
        <Grid item md={3}>
          <Typography className={classes.overviewHeaderTextStyle}>
            STATUS
          </Typography>
        </Grid>
        <Grid item md={6}>
          <span className={classes.headerWithSubheaderContainerStyle}>
            <Typography className={classes.overviewHeaderTextStyle}>
              INSIGHTS
            </Typography>
            <Typography className={classes.subheaderTextStyle}>
              (last 30 days)
            </Typography>
          </span>
        </Grid>
        <Grid item md={3}>
          <Typography className={classes.overviewHeaderTextStyle}>
            STANDARDS
          </Typography>
        </Grid>
      </Grid>
      <Grid item md={12} className={classes.overviewCardsContainerStyle}>
        <Grid item md={3}>
          <StatusCard serviceId={service!.id} refreshStatus={refreshStatus} />
        </Grid>
        <Grid item md={6} className={classes.incidentMetricsContainerStyle}>
          <Grid item md={4}>
            <InsightsCard
              count={
                service?.metrics !== undefined && service.metrics.length > 0
                  ? service?.metrics[0].total_interruptions
                  : undefined
              }
              label="interruptions"
              color={theme.palette.textSubtle}
            />
          </Grid>
          <Grid item md={4}>
            <InsightsCard
              count={
                service?.metrics !== undefined && service.metrics.length > 0
                  ? service?.metrics[0].total_high_urgency_incidents
                  : undefined
              }
              label="high urgency"
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item md={4}>
            <InsightsCard
              count={
                service?.metrics !== undefined && service?.metrics?.length > 0
                  ? service?.metrics[0].total_incident_count
                  : undefined
              }
              label="incidents"
              color={theme.palette.error.main}
            />
          </Grid>
        </Grid>
        <Grid item md={3}>
          <ServiceStandardsCard
            total={
              service?.standards?.score !== undefined
                ? service?.standards?.score?.total
                : undefined
            }
            completed={
              service?.standards?.score !== undefined
                ? service?.standards?.score?.passing
                : undefined
            }
            standards={
              service?.standards !== undefined
                ? service?.standards?.standards
                : undefined
            }
          />
        </Grid>
      </Grid>

      <Divider />
      <CardContent>
        <TabbedCard>
          <CardTab label="Incidents">
            <Incidents
              serviceId={service!.id}
              refreshIncidents={refreshIncidents}
            />
          </CardTab>
          {disableChangeEvents !== true ? (
            <CardTab label="Change Events">
              <ChangeEvents
                data-testid="change-events"
                serviceId={service!.id}
                refreshEvents={refreshChangeEvents}
              />
            </CardTab>
          ) : (
            <></>
          )}
        </TabbedCard>
        {disableOnCall !== true ? (
          <>
            <Typography className={classes.oncallHeaderTextStyle}>
              ON CALL
            </Typography>
            <EscalationPolicy
              data-testid="oncall-card"
              policyId={service!.policyId}
              policyUrl={service!.policyLink}
              policyName={service!.policyName}
            />
          </>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
};
