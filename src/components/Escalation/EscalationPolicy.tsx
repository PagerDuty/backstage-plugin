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
import { List, ListSubheader, createStyles, makeStyles } from "@material-ui/core";
import { EscalationUsersEmptyState } from "./EscalationUsersEmptyState";
import { EscalationUsersForbiddenState } from "./EscalationUsersForbiddenState";
import { EscalationUser } from "./EscalationUser";
import useAsync from "react-use/lib/useAsync";
import { pagerDutyApiRef } from "../../api";
import { Alert } from "@material-ui/lab";

import { useApi } from "@backstage/core-plugin-api";
import { Progress } from "@backstage/core-components";
import { BackstageTheme } from "@backstage/theme";

type Props = {
  policyId: string;
  policyUrl: string;
  policyName: string;
};
const useStyles = makeStyles<BackstageTheme>(() =>
  createStyles({
    listStyle: {
      marginLeft: "-15px",
    },
  })
);

export const EscalationPolicy = ({
  policyId,
  policyUrl,
  policyName,
}: Props) => {
  const api = useApi(pagerDutyApiRef);
  const classes = useStyles();

  const {
    value: users,
    loading,
    error,
  } = useAsync(async () => {
    return await api.getOnCallByPolicyId(policyId);
  });

  if (error) {
    if (error.message.includes("Forbidden")) {
      return (
        <List dense subheader={<ListSubheader>ON CALL</ListSubheader>}>
          <EscalationUsersForbiddenState />
        </List>
      );
    }

    return (
      <Alert severity="error">
        Error encountered while fetching information. {error.message}
      </Alert>
    );
  }

  if (loading) {
    return <Progress />;
  }

  if (!users?.length) {
    return <EscalationUsersEmptyState />;
  }

  return (
    <List
      dense
      className={classes.listStyle}
    >
      {users!.map((user, index) => (
        <EscalationUser
          key={index}
          user={user}
          policyUrl={policyUrl}
          policyName={policyName}
        />
      ))}
    </List>
  );
};
