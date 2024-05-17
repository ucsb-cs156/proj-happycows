import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { announcementFixtures } from "fixtures/announcementFixtures";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";


const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

