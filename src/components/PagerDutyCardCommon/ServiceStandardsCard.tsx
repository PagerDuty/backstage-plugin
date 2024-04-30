import { BackstageTheme } from "@backstage/theme";
import {
  Card,
  IconButton,
  LinearProgress,
  Theme,
  Tooltip,
  Typography,
  makeStyles,
  withStyles,
} from "@material-ui/core";
import React from "react";
import InfoIcon from "@material-ui/icons/Info";
import { PagerDutyServiceStandard } from "@pagerduty/backstage-plugin-common";
import CheckCircle from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

type Props = {
  total: number | undefined;
  completed: number | undefined;
  standards: PagerDutyServiceStandard[] | undefined;
  compact?: boolean;
};

function colorFromPercentage(theme: Theme, percentage: number) {
  if (percentage < 0.5) {
    return theme.palette.error.main;
  } else if (percentage < 0.8) {
    return theme.palette.warning.main;
  }
  return theme.palette.success.main;
}

function ServiceStandardsCard({ total, completed, standards, compact }: Props) {
  const useStyles = makeStyles<BackstageTheme>((theme) => ({
    cardStyle: {
      height: compact !== true ? "120px" : "80px",
      display: "grid",
      gridTemplateRows: "1fr auto auto",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
    containerStyle: {
      display: "flex",
      justifyContent: "center",
      marginTop: compact !== true ? "-100px" : "-50px",
    },
    largeTextStyle: {
      fontSize: compact !== true ? "50px" : "40px",
      color:
        completed !== undefined && total !== undefined
          ? colorFromPercentage(theme, completed / total)
          : colorFromPercentage(theme, 0),
      alignSelf: "center",
      justifyContent: "center",
    },
    smallTextStyle: {
      color: theme.palette.textSubtle,
      fontSize: compact !== true ? "14px" : "12px",
      fontWeight: "bold",
      alignSelf: "center",
      justifyContent: "center",
      marginLeft: "-2px",
      marginTop: compact !== true ? "25px" : "20px",
    },
    tooltipContainer: {},
    tooltipIcon: {
      marginRight: "5px",
    },
    standardItem: {
      display: "flex",
      alignItems: "center",
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
      backgroundColor:
        completed !== undefined && total !== undefined
          ? colorFromPercentage(theme, completed / total)
          : colorFromPercentage(theme, 0),
    },
  }))(LinearProgress);

  const {
    cardStyle,
    containerStyle,
    largeTextStyle,
    smallTextStyle,
    tooltipContainer,
    tooltipIcon,
    standardItem,
  } = useStyles();

  if (standards === undefined || completed === undefined || total === undefined) {
    return (
      <Card className={cardStyle}>
        <div className={containerStyle}>
          <Typography className={smallTextStyle}>
            Unable to retrieve Scores
          </Typography>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={cardStyle}>
      {completed !== undefined && total !== undefined ? (
        <>
          <div className={tooltipContainer}>
            <IconButton>
              <Tooltip
                interactive
                title={
                  <>
                    {standards?.map((standard, key) => (
                      <p key={key}>
                        {standard.pass ? (
                          <span className={standardItem}>
                            <CheckCircle className={tooltipIcon} />{" "}
                            {standard.name}
                          </span>
                        ) : (
                          <span className={standardItem}>
                            <RadioButtonUncheckedIcon className={tooltipIcon} />{" "}
                            {standard.name}
                          </span>
                        )}
                      </p>
                    ))}
                  </>
                }
              >
                <InfoIcon />
              </Tooltip>
            </IconButton>
          </div>
          <div className={containerStyle}>
            <Typography className={largeTextStyle}>{completed}</Typography>
            <Typography className={smallTextStyle}>/{total}</Typography>
          </div>
          <div>
            <BorderLinearProgress
              variant="determinate"
              value={(completed! / total!) * 100}
            />
          </div>
        </>
      ) : (
        <div className={containerStyle}>
          <Typography className={smallTextStyle}>
            Unable to retrieve Scores
          </Typography>
        </div>
      )}
    </Card>
  );
}

export default ServiceStandardsCard;
