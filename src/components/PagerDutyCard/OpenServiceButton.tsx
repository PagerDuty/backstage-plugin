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
// import React, { useCallback, useState } from "react";
import React from "react";
import { makeStyles, IconButton } from "@material-ui/core";
import { BackstageTheme } from "@backstage/theme";

// import { usePagerdutyEntity } from "../../hooks";
// import { TriggerDialog } from "../TriggerDialog";
import OpenInBrowser from "@material-ui/icons/OpenInBrowser";

const useStyles = makeStyles<BackstageTheme>((theme) => ({
  buttonStyle: {
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: "transparent",
      textDecoration: "underline",
    },
  },
  containerStyle: {
    flex: "flex",
    fontSize: "14px",
    width: "85px",
    lineHeight: "14px",
  },
  iconStyle: {
    fontSize: "35px",
    marginBottom: "-10px",
  },
}));

/** @public */
export function OpenServiceButton(props: { serviceUrl: string}) {
  const { buttonStyle, containerStyle, iconStyle } = useStyles();
  // const { integrationKey, name } = usePagerdutyEntity();
  // const [dialogShown, setDialogShown] = useState<boolean>(false);

  // const showDialog = useCallback(() => {
  //   setDialogShown(true);
  // }, [setDialogShown]);
  // const hideDialog = useCallback(() => {
  //   setDialogShown(false);
  // }, [setDialogShown]);

  function navigateToService() {
    window.open(props.serviceUrl, "_blank");
  }

  return (
    <>
      <IconButton
        aria-label="open-service-in-browser"
        onClick={navigateToService}
        className={buttonStyle}
      >
        <div className={containerStyle}>
          <OpenInBrowser className={iconStyle} />
          <p>Open service in PagerDuty</p>
        </div>
      </IconButton>
      {/* {integrationKey && (
        <TriggerDialog
          showDialog={dialogShown}
          handleDialog={hideDialog}
          integrationKey={integrationKey}
          name={name}
        />
      )} */}
    </>
  );
}
