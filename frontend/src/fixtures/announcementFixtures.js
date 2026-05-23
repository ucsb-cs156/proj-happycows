const announcementFixtures = {
  oneAnnouncement: {
    id: 1,
    commonsId: 1,
    startDate: "2024-12-12T00:00:00",
    endDate: "2025-12-12T00:00:00",
    announcementText: "System maintenance scheduled for next week.",
  },
  threeAnnouncements: [
    {
      id: 1,
      commonsId: 1,
      startDate: "2024-12-12T00:00:00",
      endDate: "2025-12-12T00:00:00",
      announcementText: "System maintenance scheduled for next week.",
    },
    {
      id: 2,
      commonsId: 1,
      startDate: "2022-12-12T00:00:00",
      endDate: "2023-01-12T00:00:00",
      announcementText: "This is a test announcement for commons id 1.",
    },
    {
      id: 3,
      commonsId: 1,
      startDate: "2024-11-12T00:00:00",
      endDate: "2025-10-12T00:00:00",
      announcementText: "Welcome to the commons! Please read the rules.",
    },
  ],
};

export { announcementFixtures };
