import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Header, Page, Content } from "@backstage/core-components";
import { ServiceMappingComponent } from "./ServiceMappingComponent";

/** @public */
export const PagerDutyPage = () => {
  return (
    <Page themeId="home">
      <Header title="PagerDuty" subtitle="Advanced configurations" />
      <Content>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <Typography variant="h4">Service to Entity mapping</Typography>
            <Typography variant="body1">
              Easily map your services to entities in Backstage without the need to add anotations to all your projects.
            </Typography>
            <Typography variant="body1">
              <b>Warning: </b>Only 1:1 mapping is allowed at this time.
            </Typography>
          </Grid>
          <Grid item>
            <ServiceMappingComponent />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
