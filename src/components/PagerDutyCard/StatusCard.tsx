import { Card, Typography } from "@material-ui/core";
import React from "react";
import { Theme, makeStyles } from "@material-ui/core/styles";
import { BackstageTheme } from "@backstage/theme";

type Props = {
  status: string | undefined;
};

function labelFromStatus(status: string) {
  let label;
  switch (status) {
    case "active":
      label = "OK";
      break;
    case "warning":
      label = "ACTIVE";
      break;
    case "critical":
      label = "ALARM";
      break;
    case "maintenance":
      label = "MAINTENANCE";
      break;
    case "disabled":
      label = "DISABLED";
      break;
    default:
      label = "OK";
      break;
  }

  return label;
}

function colorFromStatus(theme: Theme, status: string) {
  let color;
  switch (status) {
    case "active":
      color = theme.palette.success.main;
      break;
    case "warning":
      color = theme.palette.warningBackground;
      break;
    case "critical":
      color = theme.palette.error.main;
      break;
    case "maintenance":
      color = "#ebdc00";
      break;
    case "disabled":
      color = "#A9A9A9";
      break;
    default:
      color = theme.palette.success.main;
      break;  
  }

  return color;
}

function StatusCard({ status }: Props) {
  const useStyles = makeStyles<BackstageTheme>((theme) => ({
    cardStyle: {
      height: "120px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colorFromStatus(theme, status),
      marginRight: "10px",
    },
    largeTextStyle: {
      color: "white",
      fontWeight: "bold",
      fontSize: "20px",
    },
  }));

  const { cardStyle, largeTextStyle } = useStyles();

  return (
    <Card className={cardStyle}>
      <Typography className={largeTextStyle}>{labelFromStatus(status)}</Typography>
    </Card>
  );
}

export default StatusCard;
