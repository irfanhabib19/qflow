import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";

import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./pages/AdminDashboard";
import CreateQueue from "./pages/CreateQueue";
import QueueAdmin from "./pages/QueueAdmin";

import JoinQueue from "./pages/JoinQueue";
import UserQueue from "./pages/UserQueue";
import DisplayBoard from "./pages/DisplayBoard";
import TicketStatus from "./pages/TicketStatus";

import Login from "./pages/Login";
import Register from "./pages/Register";

import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";


export default function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* ==================================
                    PUBLIC
                ================================== */}

                <Route
                    path="/"
                    element={<JoinQueue />}
                />

                <Route
                    path="/join"
                    element={<JoinQueue />}
                />


                {/* ==================================
                    USER QUEUE
                ================================== */}

                <Route
                    path="/queue/:queueId"
                    element={<UserQueue />}
                />


                {/* ==================================
                    DISPLAY BOARD
                ================================== */}

                <Route
                    path="/display"
                    element={<DisplayBoard />}
                />

                <Route
                    path="/display/:queueId"
                    element={<DisplayBoard />}
                />


                {/* ==================================
                    TICKET STATUS
                ================================== */}

                <Route
                    path="/ticket/:queueId/:ticketId"
                    element={<TicketStatus />}
                />


                {/* ==================================
                    AUTH
                ================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==================================
                    AUTHENTICATED USER
                ================================== */}

                <Route element={<UserRoute />}>

                    <Route
                        path="/my-tickets"
                        element={<MyTickets />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                </Route>


                {/* ==================================
                    ADMIN
                ================================== */}

                <Route element={<AdminRoute />}>

                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/create-queue"
                        element={<CreateQueue />}
                    />

                    <Route
                        path="/admin/queue/:queueId"
                        element={<QueueAdmin />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}