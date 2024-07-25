import React, { useEffect, useState } from "react";
import {
  Card,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import {
  Header,
  Page,
  Content,
  TabbedLayout,
} from "@backstage/core-components";
import { ServiceMappingComponent } from "./ServiceMappingComponent";
import { useApi } from "@backstage/core-plugin-api";
import { pagerDutyApiRef } from "../../api";
import { NotFoundError } from "@backstage/errors";

const SERVICE_DEPENDENCY_SYNC_STRATEGY =
  "settings::service-dependency-sync-strategy";

/** @public */
export const PagerDutyPage = () => {
  const pagerDutyApi = useApi(pagerDutyApiRef);
  const [
    selectedServiceDependencyStrategy,
    setSelectedServiceDependencyStrategy,
  ] = useState("disabled");

  useEffect(() => {
    function fetchSetting() {
      pagerDutyApi
        .getSetting(SERVICE_DEPENDENCY_SYNC_STRATEGY)
        .then((result) => {
          if (result !== undefined) {
            setSelectedServiceDependencyStrategy(result.value);
          }
        })
        .catch((error) => {
          if (error instanceof NotFoundError) {
            // If the setting is not found, set the default value to "disabled"
            setSelectedServiceDependencyStrategy("disabled");
          }
        });
    }

    fetchSetting();
  }, [pagerDutyApi]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = getSelectedValue((event.target as HTMLInputElement).value);

    setSelectedServiceDependencyStrategy(value);

    pagerDutyApi.storeSettings([
      {
        id: SERVICE_DEPENDENCY_SYNC_STRATEGY,
        value,
      },
    ]);
  };

  function getSelectedValue(
    value: string
  ): "backstage" | "pagerduty" | "both" | "disabled" {
    switch (value) {
      case "backstage":
        return "backstage";
      case "pagerduty":
        return "pagerduty";
      case "both":
        return "both";
      default:
        return "disabled";
    }
  }

  return (
    <Page themeId="home">
      <Header title="PagerDuty" subtitle="Advanced configurations" />
      <Content>
        <TabbedLayout>
          <TabbedLayout.Route path="/service-mapping" title="Service Mapping">
            <Grid container spacing={3} direction="column">
              <Grid item>
                {/* <Typography variant="h4">Service to Entity mapping</Typography> */}
                <Typography variant="body1">
                  Easily map your existing PagerDuty services to entities in
                  Backstage without the need to add anotations to all your
                  projects.
                </Typography>
                <Typography variant="body1">
                  <b>Warning: </b>Only 1:1 mapping is allowed at this time.
                </Typography>
              </Grid>
              <Grid item>
                <ServiceMappingComponent />
              </Grid>
            </Grid>
          </TabbedLayout.Route>
          <TabbedLayout.Route path="/settings" title="Configuration">
            <Grid container spacing={3} direction="column">
              <Grid item>
                <Typography variant="h4">Plugin configuration</Typography>
                <Typography variant="body1">
                  Configure your PagerDuty plugin configuration here
                </Typography>
              </Grid>
              <Card
                title="Service dependency synchronization preferences"
                style={{ padding: "10px", paddingLeft: "15px", width: "50%" }}
              >
                <>
                  <Typography variant="h6">
                    Service dependency synchronization strategy
                  </Typography>
                  <Typography variant="body1">
                    Select the main source of truth for your service dependencies
                  </Typography>
                  <RadioGroup
                    value={selectedServiceDependencyStrategy}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="backstage"
                      control={<Radio />}
                      label="Backstage"
                    />
                    <FormControlLabel
                      value="pagerduty"
                      control={<Radio />}
                      label="PagerDuty"
                      disabled
                    />
                    <FormControlLabel
                      value="both"
                      control={<Radio />}
                      label="Both"
                    />
                    <FormControlLabel
                      value="disabled"
                      control={<Radio />}
                      label="Disabled"
                    />
                  </RadioGroup>
                </>

                <br />
                <br />
                <Typography variant="body1">
                  <b>Warning: </b>Changing this setting will affect how your
                  service dependencies are synchronized and may cause data loss.
                  Check the <a style={{color: "cadetblue"}} href="https://pagerduty.github.io/backstage-plugin-docs/index.html"> documentation </a> for more information.
                </Typography>
              </Card>
            </Grid>
          </TabbedLayout.Route>
        </TabbedLayout>
      </Content>
    </Page>
  );
};
