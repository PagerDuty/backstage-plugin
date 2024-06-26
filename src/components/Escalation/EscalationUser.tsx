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
  ListItemIcon,
  Tooltip,
  ListItemText,
  makeStyles,
  IconButton,
  Typography,
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { PagerDutyUser } from '@pagerduty/backstage-plugin-common';
import NotificationsIcon from "@material-ui/icons/Notifications";
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>((theme) => ({
  listItemPrimary: {
    fontWeight: "bold",
  },
  listItemSecondary: {
    fontWeight: "normal",
    textDecoration: "underline",
    marginTop: "-5px",
  },
  buttonStyle: {
    marginLeft: "-11px",
    marginTop: "-10px",
    fontSize: "15px",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  },
  userTextButtonStyle: {
    marginLeft: "-11px",
    marginTop: "-10px",
    marginBottom: "-10px",
    fontSize: "15px",
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  },
  containerStyle: {
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
  },
  iconStyle: {
    fontSize: "25px",
    marginLeft: "-4px",
    color: theme.palette.text.primary,
  },
  smallIconStyle: {
    color: theme.palette.text.primary,
  },
  avatarStyle: {
    marginTop: "-20px",
  },
}));

type Props = {
  user: PagerDutyUser;
  policyUrl: string;
  policyName: string;
};

function navigateToUrl(url: string) {
  // open url in new browser window
  window.open(url, "_blank");
}

export const EscalationUser = ({ user, policyUrl, policyName }: Props) => {
  const classes = useStyles();

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar
          alt={user.name}
          src={user.avatar_url}
          className={classes.avatarStyle}
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            <Tooltip title="Open user in PagerDuty" placement="top">
              <IconButton
                aria-label="open-user-in-browser"
                onClick={() => navigateToUrl(user.html_url)}
                className={classes.userTextButtonStyle}
              >
                <span className={classes.containerStyle}>{user.name}</span>
              </IconButton>
            </Tooltip>

            <Typography
              className={classes.listItemSecondary}
              color="textSecondary"
            >
              {user.email}
            </Typography>
          </>
        }
        secondary={
          <IconButton
            aria-label="open-escalation-policy-in-browser"
            onClick={() => navigateToUrl(policyUrl)}
            className={classes.buttonStyle}
          >
            <span className={classes.containerStyle}>
              <NotificationsIcon className={classes.iconStyle} />
              {policyName}
            </span>
          </IconButton>
        }
      />
    </ListItem>
  );
};
