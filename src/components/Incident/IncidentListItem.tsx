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
import {
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  ListItemText,
  makeStyles,
  IconButton,
  Typography,
  Chip,
} from '@material-ui/core';
import { DateTime, Duration } from 'luxon';
import { PagerDutyIncident } from '@pagerduty/backstage-plugin-common';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { BackstageTheme } from '@backstage/theme';
import { Link } from '@backstage/core-components';

const useStyles = makeStyles<BackstageTheme>((theme) => ({
  denseListIcon: {
    marginRight: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  listItemPrimary: {
    fontWeight: "bold",
  },
  warning: {
    borderColor: theme.palette.warning.main,
    color: "#fff",
    backgroundColor: theme.palette.warning.main,
    boxShadow: "0 4px 4px 0 rgba(0,0,0,0.2)",
    textTransform: "uppercase",
    "& *": {
      color: "#fff",
    },
  },
  error: {
    borderColor: theme.palette.error.main,
    color: "#fff",
    backgroundColor: theme.palette.error.main,
    boxShadow: "0 4px 4px 0 rgba(0,0,0,0.2)",
    textTransform: "uppercase",
    "& *": {
      color: "#fff",
    },
  },
  lowUrgency: {
    borderColor: theme.palette.warning.main,
    color: theme.palette.warning.main,
    backgroundColor: "#fff",
    boxShadow: "0 4px 4px 0 rgba(0,0,0,0.2)",
    textTransform: "uppercase",
    "& *": {
      color: theme.palette.warning.main,
    },
  },
  highUrgency: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    backgroundColor: "#fff",
    boxShadow: "0 4px 4px 0 rgba(0,0,0,0.2)",
    textTransform: "uppercase",
    "& *": {
      color: theme.palette.error.main,
    },
  },
  textContainer: {
    display: "flex",
    alignItems: "baseline",
  },
  smallIconStyle: {
    color: theme.palette.text.primary,
    marginRight: "-20px",
  },
}));

type Props = {
  incident: PagerDutyIncident;
};

export const IncidentListItem = ({ incident }: Props) => {
  const classes = useStyles();
  const duration =
    new Date().getTime() - new Date(incident.created_at).getTime();
  const createdAt = DateTime.local()
    .minus(Duration.fromMillis(duration))
    .toRelative({ locale: 'en' });
  const user = incident.assignments[0]?.assignee;

  return (
    <ListItem dense key={incident.id}>
      <ListItemText
        primary={
          <div className={classes.textContainer}>
            <Chip
              data-testid={`chip-${incident.status}`}
              label={incident.status}
              size="small"
              variant="outlined"
              className={
                incident.status === "triggered"
                  ? classes.error
                  : classes.warning
              }
            />
            <Chip
              data-testid={`chip-${incident.urgency}`}
              label={`${incident.urgency} urgency`}
              size="small"
              variant="outlined"
              className={
                incident.urgency === "high"
                  ? classes.highUrgency
                  : classes.lowUrgency
              }
            />
            {incident.title}
          </div>
        }
        primaryTypographyProps={{
          variant: "body1",
          className: classes.listItemPrimary,
        }}
        secondary={
          <Typography noWrap variant="body2" color="textSecondary">
            Created {createdAt} and assigned to{" "}
            <Link to={user?.html_url ?? "#"}>{user?.summary ?? "nobody"}</Link>
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <Tooltip title="View in PagerDuty" placement="top">
          <IconButton
            href={incident.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.smallIconStyle}
          >
            <OpenInBrowserIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
