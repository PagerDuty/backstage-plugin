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
import React, { useEffect } from 'react';
import { List } from '@material-ui/core';
import { ChangeEventListItem } from './ChangeEventListItem';
import { ChangeEventEmptyState } from './ChangeEventEmptyState';
import { ChangeEventForbiddenState } from './ChangeEventForbiddenState';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { pagerDutyApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';

type Props = {
  serviceId: string;
  refreshEvents: boolean;
};

export const ChangeEvents = ({ serviceId, refreshEvents }: Props) => {
  const api = useApi(pagerDutyApiRef);

  const [{ value: changeEvents, loading, error }, getChangeEvents] = useAsyncFn(
    async () => {
      const { change_events } = await api.getChangeEventsByServiceId(serviceId);
      return change_events;
    },
  );

  useEffect(() => {
    getChangeEvents();
  }, [refreshEvents, getChangeEvents]);

  if (error) {
    if (error.message.includes('Forbidden')) {
      return <ChangeEventForbiddenState />;
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

  if (!changeEvents?.length) {
    return <ChangeEventEmptyState />;
  }

  return (
    <List dense>
      {changeEvents!.map((changeEvent, index) => (
        <ChangeEventListItem
          key={changeEvent.id + index}
          changeEvent={changeEvent}
        />
      ))}
    </List>
  );
};
