/*
 * Copyright 2021 The Backstage Authors
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
import React, { useCallback, useState } from "react";
import { makeStyles, IconButton } from "@material-ui/core";
import { BackstageTheme } from "@backstage/theme";

import { TriggerDialog } from "../TriggerDialog";
import AddAlert from "@material-ui/icons/AddAlert";

/** @public */
export type TriggerIncidentButtonProps = {
  integrationKey: string | undefined;
  entityName: string;
  compact?: boolean;
  handleRefresh: () => void;
}

/** @public */
export function TriggerIncidentButton({ integrationKey, entityName, compact, handleRefresh } : TriggerIncidentButtonProps) {
  const useStyles = makeStyles<BackstageTheme>((theme) => ({
    buttonStyle: {
      color: theme.palette.text.primary,
      "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
      },
    },
    containerStyle: {
      fontSize: compact !== true ? "12px" : "10px",
      width: compact !== true ? "80px" : "60px",
      marginRight: "-10px",
    },
    iconStyle: {
      fontSize: "30px",
      marginBottom: "-10px",
    },
    textStyle: {
      marginBottom: "-10px",
    },
  }));

  const { buttonStyle, containerStyle, iconStyle, textStyle } = useStyles();
  const [dialogShown, setDialogShown] = useState<boolean>(false);

  const showDialog = useCallback(() => {
    setDialogShown(true);
  }, [setDialogShown]);
  const hideDialog = useCallback(() => {
    setDialogShown(false);
  }, [setDialogShown]);
  
  const disabled = !integrationKey;
  
  return (
    <>
      <IconButton
        aria-label="create-incident"
        onClick={showDialog}
        className={disabled ? "" : buttonStyle}
        disabled={disabled}
      >
        <div className={containerStyle}>
          <AddAlert className={iconStyle} />
          <p className={textStyle}>Create new incident</p>
        </div>
      </IconButton>
      {integrationKey && (
        <TriggerDialog
          showDialog={dialogShown}
          handleDialog={hideDialog}
          integrationKey={integrationKey}
          serviceName={entityName}
          onIncidentCreated={handleRefresh}
        />
      )}
    </>
  );
}
