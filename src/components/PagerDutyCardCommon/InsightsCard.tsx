import { BackstageTheme } from "@backstage/theme";
import { Card, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import validateColor from "validate-color";

type Props = {
  count: number | undefined;
  label: string;
  color: string;
};

function IncidentCounterCard({ count, label, color }: Props) {

  const textColor = color && validateColor(color) ? color : "black";

  const useStyles = makeStyles<BackstageTheme>(() => ({
    cardStyle: {
      marginRight: "10px",
      height: "120px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
    largeTextStyle: {
      color: textColor,
      fontSize: "30px",
      marginTop: "-10px",
    },
    smallTextStyle: {
      color: textColor,
      fontWeight: "bold",
      fontSize: "10px",
      marginTop: "-5px",
      textTransform: "uppercase",
      flexWrap: "wrap",
    },
  }));

  const { cardStyle, largeTextStyle, smallTextStyle } = useStyles();

  return (
    <Card className={cardStyle}>
      {(count !== undefined) ? (
        <>
          <Typography className={largeTextStyle}>{count}</Typography>
          <Typography className={smallTextStyle}>{label}</Typography>
        </>
      ) : (
        <>
          <Typography className={largeTextStyle}>-</Typography>
          <Typography className={smallTextStyle}>{label}</Typography>
        </>
      )}
    </Card>
  );
}

export default IncidentCounterCard;
