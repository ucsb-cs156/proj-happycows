import React from "react";
import { Card } from "react-bootstrap";
import PagedProfitsTable from "main/components/Commons/PagedProfitsTable";




const Profits = () =>{
    return (
        <Card>
            <Card.Header as="h5" className = "woodenboardtable">
                Profits
            </Card.Header>
            <Card.Body style={
                // Stryker disable next-line all: don't test CSS params
                {backgroundColor: "rgb(245, 210, 140)"}}>
                {/* change 4am to admin-appointed time? And consider adding milk bottle as decoration */}
                <Card.Title>
                    You will earn profits from milking your cows everyday at 4am.
                </Card.Title>
                <PagedProfitsTable/>
            </Card.Body>
        </Card>
    );
};

export default Profits;
