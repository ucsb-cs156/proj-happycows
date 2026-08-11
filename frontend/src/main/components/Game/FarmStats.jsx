import React from "react";
import { Card } from "react-bootstrap";
import { ProgressBar } from "react-bootstrap";

const FarmStats = ({ farmer }) => {
  return (
    <Card>
      <Card.Header as="h5" className="woodenboardtable">
        Your Farm Stats
      </Card.Header>
      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        {/* update total wealth and cow health with data from fixture */}
        <Card.Title className="text-center">
          💰 Total Wealth: ${farmer.totalWealth.toFixed(2)}
        </Card.Title>
        <Card.Text>Total Cows Bought: {farmer.cowsBought}</Card.Text>
        <Card.Text>Total Cows Sold: {farmer.cowsSold}</Card.Text>
        <Card.Title className="text-center">
          ❤️ Cow Health: {Math.round(farmer.cowHealth * 100) / 100}%
        </Card.Title>
        <ProgressBar
          now={farmer.cowHealth}
          min={0}
          max={100}
          variant="danger"
        />
        <Card.Text>💀 Cow Deaths: {farmer.cowDeaths}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FarmStats;
