import { BackstageTheme } from "@backstage/theme";
import { Card, Typography, makeStyles } from "@material-ui/core";
import React from "react";

type cardLabel = "triggered" | "acknowledged" | "resolved";

const cardLabels = {
  triggered: "TRIGGERED",
  acknowledged: "ACKNOWLEDGED",
  resolved: "RESOLVED",
};

type Props = {
  count: number;
  label: cardLabel;
};

function colorFromLabel(theme: BackstageTheme, label: cardLabel) {
  const cardColors = {
    triggered: theme.palette.error.main,
    acknowledged: theme.palette.warning.main,
    resolved: theme.palette.success.main,
  };

  return cardColors[label];
}

function IncidentCounterCard({ count, label }: Props) {

  const useStyles = makeStyles<BackstageTheme>((theme) => ({
    cardStyle: {
      marginRight: "10px",
      height: "120px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
    largeTextStyle: {
      color: colorFromLabel(theme, label),
      fontSize: "40px",
      marginTop: "-20px",
    },
    smallTextStyle: {
      color: colorFromLabel(theme, label),
      fontWeight: "bold",
      fontSize: "10px",
      marginTop: "-10px",
    },
  }));

  const { cardStyle, largeTextStyle, smallTextStyle } = useStyles();

  return (
    <Card className={cardStyle}>
      <Typography className={largeTextStyle}>{count}</Typography>
      <Typography className={smallTextStyle}>{cardLabels[label]}</Typography>
    </Card>
  );
}

export default IncidentCounterCard;
