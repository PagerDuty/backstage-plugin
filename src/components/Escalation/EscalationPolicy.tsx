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
import { List, ListSubheader } from '@material-ui/core';
import { EscalationUsersEmptyState } from './EscalationUsersEmptyState';
import { EscalationUser } from './EscalationUser';
import useAsync from 'react-use/lib/useAsync';
import { pagerDutyApiRef } from '../../api';
import { Alert } from '@material-ui/lab';

import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';

type Props = {
  policyId: string;
};

export const EscalationPolicy = ({ policyId }: Props) => {
  const api = useApi(pagerDutyApiRef);

  const {
    value: users,
    loading,
    error,
  } = useAsync(async () => {
    const { oncalls } = await api.getOnCallByPolicyId(policyId);
    const usersItem = oncalls
      .filter((oncall) => oncall.escalation_level === 1)
      .sort((a, b) => a.user.name > b.user.name ? 1 : -1)
      .map((oncall) => oncall.user);

    // remove duplicates from usersItem
    const uniqueUsers = new Map();
    usersItem.forEach((user) => {
      uniqueUsers.set(user.id, user);
    });

    usersItem.length = 0;
    uniqueUsers.forEach((user) => {
      usersItem.push(user);
    });

    return usersItem;
  });

  if (error) {
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
    <List dense subheader={<ListSubheader>ON CALL</ListSubheader>}>
      {users!.map((user, index) => (
        <EscalationUser key={index} user={user} />
      ))}
    </List>
  );
};
