import { useState, useEffect } from "react"
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsList from "main/components/Commons/CommonsList";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import { commonsNotJoined } from "main/utils/commonsUtils";
import getBackgroundImage from "main/components/Utils/HomePageBackground";

import "./HomePage.css"

export function getRandomGreeting() {
  const greetings = [
    "Howdy Farmer",
    "Hello Farmer",
    "Hi Farmer",
    "Greetings Farmer",
    "Welcome Farmer",
    "Hey there Farmer",
    "Good to see you Farmer",
    "Salutations Farmer",
    "What's up Farmer",
    "Ahoy Farmer",
    "Good day Farmer",
    "Pleased to see you Farmer",
    "Welcome back Farmer",
    "Hello there Farmer",
  ];

  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

export default function HomePage({hour=null}) {
  // Stryker disable next-line all: it is acceptable to exclude useState calls from mutation testing
  const [commonsJoined, setCommonsJoined] = useState([]);
  const { data: currentUser } = useCurrentUser();

  // Stryker disable all : it is acceptable to exclude useBackend calls from mutation testing
  const { data: commons } =
    useBackend(
      ["/api/commons/all"],
      { url: "/api/commons/all" },
      []
    );
  // Stryker restore all

  const objectToAxiosParams = (newCommonsId) => ({
    url: "/api/commons/join",
    method: "POST",
    params: {
      commonsId: newCommonsId
    }
  });

  // Stryker disable all : it is acceptable to exclude useBackendMutation calls from mutation testing
  const mutation = useBackendMutation(
    objectToAxiosParams,
    {},
    ["/api/currentUser"]
  );
  // Stryker restore all


  // Stryker disable all : TODO: restructure this code to avoid the need for this disable
  useEffect(
    () => {
      if (currentUser?.root?.user?.commons) {
        setCommonsJoined(currentUser.root.user.commons);
      }
    }, [currentUser]
  );

  const firstName = (currentUser?.root?.user?.givenName) || "";
  const time = (hour===null) ? new Date().getHours() : hour;
  const Background = getBackgroundImage(time);

  // Stryker restore all

  let navigate = useNavigate();
  const visitButtonClick = (id) => { navigate("/play/" + id) };

  //create a list of commons that the user hasn't joined for use in the "Join a New Commons" list.
  const commonsNotJoinedList = commonsNotJoined(commons, commonsJoined);
  
  return (
    <div data-testid={"HomePage-main-div"} style={{ backgroundSize: 'cover', backgroundImage: `url(${Background})` }}>
      <BasicLayout>
        <div data-testid= {"HomePage-intro-card"} className="title-box">
          <h1 data-testid="homePage-title" className="new-title" >{getRandomGreeting()} {firstName}!</h1>
        </div>
        <Container>
          <Row>
            <div className="homePage-boxes">
              <div className="homePage-box">
                <Col sm><CommonsList commonList={commonsJoined} title="Visit A Commons" buttonText={"Visit"} buttonLink={visitButtonClick} /></Col>
              </div>
              <div className="homePage-box">
                <Col sm><CommonsList commonList={commonsNotJoinedList} title="Join A New Commons" buttonText={"Join"} buttonLink={mutation.mutate} /></Col>
              </div>
            </div>
          </Row>
        </Container>
      </BasicLayout>
    </div>
  )
}
