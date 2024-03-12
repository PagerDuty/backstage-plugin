import { BackstageTheme } from "@backstage/theme";
import {
  Card,
  LinearProgress,
  Theme,
  Typography,
  makeStyles,
  withStyles,
} from "@material-ui/core";
import React from "react";

type Props = {
  total: number;
  completed: number;
};

function colorFromPercentage(theme: Theme, percentage: number) {
  if (percentage < 0.5) {
    return theme.palette.error.main;
  } else if (percentage < 0.8) {
    return theme.palette.warning.main;
  }
  return theme.palette.success.main;
}

function ServiceStandardsCard({ total, completed }: Props) {
  const useStyles = makeStyles<BackstageTheme>((theme) => ({
    cardStyle: {
      height: "120px",
      display: "grid",
      gridTemplateRows: "1fr auto auto",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
    containerStyle: {
      display: "flex",
      justifyContent: "center",
    },
    largeTextStyle: {
      fontSize: "50px",
      color: colorFromPercentage(theme, completed / total),
      alignSelf: "center",
      justifyContent: "center",
    },
    smallTextStyle: {
      color: theme.palette.textSubtle,
      fontSize: "14px",
      fontWeight: "bold",
      alignSelf: "center",
      justifyContent: "center",
      marginLeft: "-2px",
      marginTop: "25px",
    },
  }));

  const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 10,
      borderRadius: 5,
      margin: 5,
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: colorFromPercentage(theme, completed / total),
    },
  }))(LinearProgress);

  const { cardStyle, containerStyle, largeTextStyle, smallTextStyle } =
    useStyles();
  return (
    <Card className={cardStyle}>
      <div className={containerStyle}>
        <Typography className={largeTextStyle}>{completed}</Typography>
        <Typography className={smallTextStyle}>/{total}</Typography>
      </div>
      <div>
        <BorderLinearProgress
          variant="determinate"
          value={(completed / total) * 100}
        />
      </div>
    </Card>
  );
}

export default ServiceStandardsCard;
