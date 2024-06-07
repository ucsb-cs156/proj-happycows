import React from 'react';
import AnnouncementCard from "main/components/Announcement/AnnouncementCard"
import { announcementFixtures } from 'fixtures/announcementFixtures'

export default {
    title: 'components/Announcement/AnnouncementCard',
    component: AnnouncementCard,
};

const Template = (args) => {
    return (
        <AnnouncementCard {...args} />
    )
};

export const ThreeItemsUser = Template.bind({});

ThreeItemsUser.args = {
    announcement: announcementFixtures.threeAnnouncements[2],
};