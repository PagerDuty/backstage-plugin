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
import { TriggerIncidentButton } from "./TriggerIncidentButton";
import { OpenServiceButton } from "./OpenServiceButton";
import {
  createStyles,
  makeStyles,
  useTheme,
} from "@material-ui/core/styles";
import StatusCard from "./StatusCard";
import IncidentCounterCard from "./IncidentCounterCard";
import ServiceStandardsCard from "./ServiceStandardsCard";
import { BackstageTheme } from "@backstage/theme";
import { TriggerDialog } from "../TriggerDialog";

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
    headerStyle: {
      marginRight: "1em",
    },
    overviewHeaderContainerStyle: {
      display: "flex",
      margin: "15px",
      marginBottom: "20px",
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
};

/** @public */
export const PagerDutyCard = (props: PagerDutyCardProps) => {
  const classes = useStyles();

  const theme = useTheme();
  const { readOnly, disableChangeEvents, integrationKey, name } = props;
  const api = useApi(pagerDutyApiRef);
  const [refreshIncidents, setRefreshIncidents] = useState<boolean>(false);
  const [refreshChangeEvents, setRefreshChangeEvents] =
    useState<boolean>(false);
  const [dialogShown, setDialogShown] = useState<boolean>(false);

  // const showDialog = useCallback(() => {
  //   setDialogShown(true);
  // }, [setDialogShown]);
  const hideDialog = useCallback(() => {
    setDialogShown(false);
  }, [setDialogShown]);

  const handleRefresh = useCallback(() => {
    setRefreshIncidents((x) => !x);
    setRefreshChangeEvents((x) => !x);
  }, []);

  const {
    value: service,
    loading,
    error,
  } = useAsync(async () => {
    const { service: foundService } = await api.getServiceByPagerDutyEntity(
      props
    );

    return {
      id: foundService.id,
      name: foundService.name,
      url: foundService.html_url,
      policyId: foundService.escalation_policy.id,
      policyLink: foundService.escalation_policy.html_url,
      status: foundService.status,
    };
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

  /**
   * In order to create incidents using the REST API, a valid user email address must be present.
   * There is no guarantee the current user entity has a valid email association, so instead just
   * only allow triggering incidents when an integration key is present.
   */
  const createIncidentDisabled = !integrationKey;

  return (
    <>
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
            !readOnly ? (
              <div>
                <TriggerIncidentButton />
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
            <Typography className={classes.overviewHeaderTextStyle}>
              INCIDENT HISTORY
            </Typography>
          </Grid>
          <Grid item md={3}>
            <Typography className={classes.overviewHeaderTextStyle}>
              SERVICE STANDARDS
            </Typography>
          </Grid>
        </Grid>
        <Grid item md={12} className={classes.overviewCardsContainerStyle}>
          <Grid item md={3}>
            <StatusCard status={service?.status} />
          </Grid>
          <Grid item md={6} className={classes.incidentMetricsContainerStyle}>
            <Grid md={4}>
              <IncidentCounterCard count={1} label="triggered" />
            </Grid>
            <Grid md={4}>
              <IncidentCounterCard count={1} label="acknowledged" />
            </Grid>
            <Grid md={4}>
              <IncidentCounterCard count={43} label="resolved" />
            </Grid>
          </Grid>
          <Grid item md={3}>
            <ServiceStandardsCard total={9} completed={8} />
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
                  serviceId={service!.id}
                  refreshEvents={refreshChangeEvents}
                />
              </CardTab>
            ) : (
              <></>
            )}
          </TabbedCard>
          <EscalationPolicy policyId={service!.policyId} />
        </CardContent>
      </Card>
      {!createIncidentDisabled && (
        <TriggerDialog
          data-testid="trigger-dialog"
          showDialog={dialogShown}
          handleDialog={hideDialog}
          onIncidentCreated={handleRefresh}
          name={name}
          integrationKey={integrationKey}
        />
      )}
    </>
  );
};
