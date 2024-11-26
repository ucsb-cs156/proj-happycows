const pagedAnnouncementFixtures = {
    emptyTable: {
        "content": [],
        "pageable": {
            "sort": {
                "empty": false,
                "unsorted": false,
                "sorted": true
            },
            "offset": 0,
            "pageNumber": 0,
            "paged": true,
            "unpaged": false
        },
        "totalPages": 0,
        "totalElements": 0,
        "last": true,
        "number": 0,
        "sort": {
            "empty": false,
            "unsorted": false,
            "sorted": true
        },
        "numberOfElements": 0,
        "first": true,
        "empty": true
    },
    smallTable:
    {
        "content": [
            {
                "id": 1,
                "commonsId": 1,
                "startDate": "2024-12-12T00:00:00",
                "endDate": "2026-12-12T00:00:00",
                "announcementText": "Announcement 1",
            },
            {
                "id": 2,
                "commonsId": 1,
                "startDate": "2022-12-12T00:00:00",
                "endDate": "2026-12-12T00:00:00",
                "announcementText": "Announcement 2",
            },
            {
                "id": 3,
                "commonsId": 1,
                "startDate": "2025-12-12T00:00:00",
                "endDate": "2026-12-12T00:00:00",
                "announcementText": "Lorem ipsum dolor sit amet,",
            },

        ],
        "pageable": {
            "sort": {
                "empty": false,
                "unsorted": false,
                "sorted": true
            },
            "offset": 0,
            "pageNumber": 0,
            "paged": true,
            "unpaged": false
        },
        "totalPages": 1,
        "totalElements": 3,
        "last": true,
        "sort": {
            "empty": false,
            "unsorted": false,
            "sorted": true
        },
        "numberOfElements": 3,
        "first": true,
        "empty": false
    },
    largeTable: [
        {
            "content": [
                {
                    "id": 1,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 1",
                },
                {
                    "id": 2,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 2",
                },
                {
                    "id": 3,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 3",
                },
                {
                    "id": 4,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 4",
                },
                {
                    "id": 5,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 5",
                },
                {
                    "id": 6,
                    "commonsId": 1,
                    "startDate": "2024-12-12T00:00:00",
                    "endDate": "2025-12-12T00:00:00",
                    "announcementText": "Lager Announcement 6",
                }
            ],
            "pageable": {
                "sort": {
                    "empty": false,
                    "unsorted": false,
                    "sorted": true
                },
                "offset": 0,
                "paged": true,
                "unpaged": false
            },
            "totalPages": 1,
            "totalElements": 6,
            "last": false,
            "sort": {
                "empty": false,
                "unsorted": false,
                "sorted": true
            },
            "numberOfElements": 6,
            "first": true,
            "empty": false
        },
    ]

};

export default pagedAnnouncementFixtures;
