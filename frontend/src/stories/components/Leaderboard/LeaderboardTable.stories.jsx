import React from "react";

import LeaderboardTable from "main/components/Leaderboard/LeaderboardTable";
import leaderboardFixtures from "fixtures/leaderboardFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/Leaderboard/LeaderboardTable",
  component: LeaderboardTable,
};

const Template = (args) => {
  return <LeaderboardTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  leaderboardUsers: [],
};

export const OneFarmer = Template.bind({});

OneFarmer.args = {
  leaderboardUsers: leaderboardFixtures.oneFarmerLB,
};

export const ThreeFarmer = Template.bind({});

ThreeFarmer.args = {
  leaderboardUsers: leaderboardFixtures.threeFarmerLB,
};

export const ThreeFarmerAdmin = Template.bind({});

ThreeFarmerAdmin.args = {
  leaderboardUsers: leaderboardFixtures.threeFarmerLB,
  currentUser: currentUserFixtures.adminUser,
};

export const FiveFarmer = Template.bind({});

FiveFarmer.args = {
  leaderboardUsers: leaderboardFixtures.fiveFarmerLB,
};

export const FiveFarmerAdmin = Template.bind({});

FiveFarmerAdmin.args = {
  leaderboardUsers: leaderboardFixtures.fiveFarmerLB,
  currentUser: currentUserFixtures.adminUser,
};

export const TenFarmer = Template.bind({});

TenFarmer.args = {
  leaderboardUsers: leaderboardFixtures.tenFarmerLB,
};
