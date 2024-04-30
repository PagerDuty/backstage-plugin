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
import React from "react";
import { makeStyles, IconButton } from "@material-ui/core";
import { BackstageTheme } from "@backstage/theme";

import OpenInBrowser from "@material-ui/icons/OpenInBrowser";

type OpenServiceButtonProps = {
  serviceUrl: string;
  compact?: boolean;
};

/** @public */
export function OpenServiceButton({ serviceUrl, compact }: OpenServiceButtonProps) {
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
      width: compact !== true ? "85px" : "70px",
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

  function navigateToService() {
    window.open(serviceUrl, "_blank");
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
          <p className={textStyle}>Open service in PagerDuty</p>
        </div>
      </IconButton>
    </>
  );
}
