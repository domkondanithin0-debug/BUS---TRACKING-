/* ==========================================
   CAMPUSRIDE - COLLEGE TRANSPORT MANAGEMENT
   Frontend demo using vanilla JavaScript
   Data is stored in the browser localStorage
========================================== */

"use strict";

// ---------- Storage Helpers ----------

const STORAGE_KEYS = {
    users: "campusride_users",
    buses: "campusride_buses",
    routes: "campusride_routes",
    students: "campusride_students",
    drivers: "campusride_drivers",
    attendance: "campusride_attendance",
    notifications: "campusride_notifications",
    session: "campusride_session"
};

function loadData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Could not load stored data:", error);
        return fallback;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Could not save data:", error);
        showToast("Unable to save data. Browser storage may be full.");
        return false;
    }
}

// ---------- Initial Demo Data ----------

function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
        saveData(STORAGE_KEYS.users, [
            {
                name: "Administrator",
                email: "admin@college.com",
                password: "admin123",
                role: "Admin"
            }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.routes)) {
        saveData(STORAGE_KEYS.routes, [
            {
                id: "R1",
                name: "Route 1 - City Center",
                pickup: "City Center",
                time: "07:30"
            },
            {
                id: "R2",
                name: "Route 2 - Railway Station",
                pickup: "Railway Station",
                time: "07:45"
            },
            {
                id: "R3",
                name: "Route 3 - Main Junction",
                pickup: "Main Junction",
                time: "08:00"
            }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.buses)) {
        saveData(STORAGE_KEYS.buses, [
            {
                id: "BUS-101",
                route: "Route 1 - City Center",
                driver: "Ramesh Kumar",
                capacity: 50,
                status: "Active"
            },
            {
                id: "BUS-102",
                route: "Route 2 - Railway Station",
                driver: "Suresh Reddy",
                capacity: 45,
                status: "Active"
            },
            {
                id: "BUS-103",
                route: "Route 3 - Main Junction",
                driver: "Prakash Rao",
                capacity: 40,
                status: "Maintenance"
            }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.students)) {
        saveData(STORAGE_KEYS.students, [
            {
                id: "STU001",
                name: "Rahul Sharma",
                email: "rahul@example.com",
                route: "Route 1 - City Center"
            },
            {
                id: "STU002",
                name: "Priya Reddy",
                email: "priya@example.com",
                route: "Route 2 - Railway Station"
            },
            {
                id: "STU003",
                name: "Arjun Kumar",
                email: "arjun@example.com",
                route: "Route 3 - Main Junction"
            }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.drivers)) {
        saveData(STORAGE_KEYS.drivers, [
            {
                id: "DRV001",
                name: "Ramesh Kumar",
                phone: "9876543210",
                bus: "BUS-101"
            },
            {
                id: "DRV002",
                name: "Suresh Reddy",
                phone: "9876543211",
                bus: "BUS-102"
            },
            {
                id: "DRV003",
                name: "Prakash Rao",
                phone: "9876543212",
                bus: "BUS-103"
            }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.attendance)) {
        saveData(STORAGE_KEYS.attendance, []);
    }

    if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
        saveData(STORAGE_KEYS.notifications, [
            {
                id: "N1",
                title: "Welcome to CampusRide",
                message: "Check your assigned bus route and departure time before travelling.",
                date: new Date().toISOString()
            },
            {
                id: "N2",
                title: "Transport Schedule",
                message: "Students are requested to arrive at their pickup points on time.",
                date: new Date().toISOString()
            }
        ]);
    }
}

initializeData();

// ---------- General Helpers ----------

let currentUser = null;
let toastTimer;

function getData(key) {
    return loadData(STORAGE_KEYS[key]);
}

function setData(key, value) {
    return saveData(STORAGE_KEYS[key], value);
}

// Escape user-entered content before displaying it in HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function todayString() {
    return new Date().toLocaleDateString("en-CA");
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateString);
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function makeBadge(status) {
    const safeStatus = escapeHTML(status);
    let badgeClass = "badge-inactive";

    if (status === "Active" || status === "Present") {
        badgeClass = status === "Present"
            ? "badge-present"
            : "badge-active";
    } else if (status === "Maintenance" || status === "Absent") {
        badgeClass = status === "Absent"
            ? "badge-absent"
            : "badge-maintenance";
    }

    return `<span class="badge ${badgeClass}">${safeStatus}</span>`;
}

function isAdmin() {
    return currentUser && currentUser.role === "Admin";
}

function requireAdmin() {
    if (!isAdmin()) {
        showToast("Only administrators can perform this action.");
        return false;
    }

    return true;
}

// ---------- Login and Registration ----------

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showLogin() {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("appPage").classList.add("hidden");

    document.getElementById("loginMessage").textContent = "";
}

function showRegister() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.remove("hidden");
    document.getElementById("appPage").classList.add("hidden");

    document.getElementById("registerMessage").textContent = "";
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const role = document.getElementById("loginRole").value;

    const users = getData("users");

    const user = users.find(function (item) {
        return item.email.toLowerCase() === email &&
            item.password === password &&
            item.role === role;
    });

    if (!user) {
        document.getElementById("loginMessage").textContent =
            "Invalid email, password, or selected role.";

        return;
    }

    currentUser = {
        name: user.name,
        email: user.email,
        role: user.role
    };

    saveData(STORAGE_KEYS.session, currentUser);

    loginForm.reset();

    openApplication();
});

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("studentName")
        .value.trim();

    const email = document.getElementById("studentEmail")
        .value.trim().toLowerCase();

    const studentId = document.getElementById("studentId")
        .value.trim();

    const route = document.getElementById("studentRoute").value;

    const password = document.getElementById("registerPassword").value;

    const users = getData("users");
    const students = getData("students");

    const message = document.getElementById("registerMessage");

    if (users.some(user => user.email.toLowerCase() === email)) {
        message.textContent = "This email is already registered.";
        return;
    }

    if (students.some(student => student.id.toLowerCase() === studentId.toLowerCase())) {
        message.textContent = "This student ID already exists.";
        return;
    }

    if (!name || !email || !studentId || !route || password.length < 6) {
        message.textContent = "Please complete all fields correctly.";
        return;
    }

    const newUser = {
        name,
        email,
        password,
        role: "Student"
    };

    const newStudent = {
        id: studentId,
        name,
        email,
        route
    };

    if (!setData("users", [...users, newUser])) {
        return;
    }

    if (!setData("students", [...students, newStudent])) {
        // Roll back the account if the student record could not be saved.
        setData("users", users);
        return;
    }

    registerForm.reset();

    showToast("Registration successful! Please log in.");

    showLogin();

    document.getElementById("loginEmail").value = email;
    document.getElementById("loginRole").value = "Student";
});

// ---------- Application Navigation ----------

const sections = [
    "dashboard",
    "buses",
    "routes",
    "students",
    "drivers",
    "attendance",
    "notifications"
];

const sectionTitles = {
    dashboard: "Dashboard",
    buses: "Bus Management",
    routes: "Route Management",
    students: "Student Management",
    drivers: "Driver Management",
    attendance: "Transport Attendance",
    notifications: "Notifications"
};

function openApplication() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("registerPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");

    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("userRole").textContent = currentUser.role;

    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            dateStyle: "medium"
        });

    document.getElementById("attendanceDate").textContent = todayString();
    document.getElementById("footerYear").textContent =
        new Date().getFullYear();

    document.querySelectorAll(".admin-only").forEach(element => {
        element.classList.toggle("hidden", !isAdmin());
    });

    // Hide student and driver records from non-admin users.
    document.querySelectorAll(".nav-btn").forEach(button => {
        const section = button.dataset.section;

        const restricted = [
            "students",
            "drivers"
        ].includes(section);

        button.classList.toggle(
            "hidden",
            restricted && !isAdmin()
        );
    });

    renderAll();
    showSection("dashboard");
}

function showSection(section) {
    if (!sections.includes(section)) return;

    if (
        !isAdmin() &&
        ["students", "drivers"].includes(section)
    ) {
        showToast("You do not have permission to open this section.");
        return;
    }

    sections.forEach(name => {
        document.getElementById(name + "Section")
            .classList.toggle("hidden", name !== section);
    });

    document.getElementById("pageTitle").textContent =
        sectionTitles[section];

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === section
        );
    });

    renderSection(section);
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", function () {
        showSection(this.dataset.section);
    });
});

document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEYS.session);

    currentUser = null;

    showLogin();

    showToast("You have been logged out.");
});

// ---------- Modals ----------

function openModal(id) {
    if (!requireAdmin()) return;

    refreshSelectOptions();

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("hidden");
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("hidden");

        const form = modal.querySelector("form");

        if (form) form.reset();
    }
}

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal").forEach(modal => {
            modal.classList.add("hidden");
        });
    }
});

// ---------- Dashboard ----------

function renderDashboard() {
    const buses = getData("buses");
    const students = getData("students");
    const drivers = getData("drivers");
    const routes = getData("routes");

    document.getElementById("totalBuses").textContent = buses.length;
    document.getElementById("totalStudents").textContent = students.length;
    document.getElementById("totalDrivers").textContent = drivers.length;
    document.getElementById("totalRoutes").textContent = routes.length;

    const dashboardBusTable =
        document.getElementById("dashboardBusTable");

    dashboardBusTable.innerHTML = buses.length
        ? buses.slice(0, 5).map(bus => `
            <tr>
                <td>${escapeHTML(bus.id)}</td>
                <td>${escapeHTML(bus.route)}</td>
                <td>${makeBadge(bus.status)}</td>
            </tr>
        `).join("")
        : emptyRow(3, "No buses available.");

    const notifications = getData("notifications").slice(-3).reverse();

    document.getElementById("dashboardNotifications").innerHTML =
        notifications.length
            ? notifications.map(notification => `
                <div class="notification-item">
                    <h4>${escapeHTML(notification.title)}</h4>
                    <p>${escapeHTML(notification.message)}</p>
                    <small>${formatDate(notification.date)}</small>
                </div>
            `).join("")
            : "<p>No notifications available.</p>";
}

// ---------- Bus Management ----------

function renderBuses(searchTerm = "") {
    const buses = getData("buses");

    const filtered = buses.filter(bus =>
        [bus.id, bus.route, bus.driver, bus.status]
            .some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    document.getElementById("busTable").innerHTML = filtered.length
        ? filtered.map(bus => `
            <tr>
                <td>${escapeHTML(bus.id)}</td>
                <td>${escapeHTML(bus.route)}</td>
                <td>${escapeHTML(bus.driver)}</td>
                <td>${escapeHTML(bus.capacity)}</td>
                <td>${makeBadge(bus.status)}</td>
                <td>
                    ${isAdmin()
                        ? `<button class="action-btn"
                            data-delete="buses"
                            data-id="${escapeHTML(bus.id)}">Delete</button>`
                        : "View only"}
                </td>
            </tr>
        `).join("")
        : emptyRow(6, "No buses found.");
}

document.getElementById("busForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!requireAdmin()) return;

    const id = document.getElementById("busNumber").value.trim().toUpperCase();
    const route = document.getElementById("busRoute").value;
    const driver = document.getElementById("busDriver").value.trim();
    const capacity = Number(document.getElementById("busCapacity").value);
    const status = document.getElementById("busStatus").value;

    const buses = getData("buses");

    if (buses.some(bus => bus.id.toLowerCase() === id.toLowerCase())) {
        showToast("This bus number already exists.");
        return;
    }

    if (!route || !driver || capacity < 1 || capacity > 100) {
        showToast("Please enter valid bus details.");
        return;
    }

    if (!setData("buses", [...buses, {
        id,
        route,
        driver,
        capacity,
        status
    }])) return;

    closeModal("busModal");

    renderAll();

    showToast("Bus added successfully.");
});

// ---------- Route Management ----------

function renderRoutes() {
    const routes = getData("routes");

    document.getElementById("routeTable").innerHTML = routes.length
        ? routes.map(route => `
            <tr>
                <td>${escapeHTML(route.id)}</td>
                <td>${escapeHTML(route.name)}</td>
                <td>${escapeHTML(route.pickup)}</td>
                <td>${escapeHTML(route.time)}</td>
                <td>
                    ${isAdmin()
                        ? `<button class="action-btn"
                            data-delete="routes"
                            data-id="${escapeHTML(route.id)}">Delete</button>`
                        : "View only"}
                </td>
            </tr>
        `).join("")
        : emptyRow(5, "No routes available.");
}

document.getElementById("routeForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!requireAdmin()) return;

    const id = document.getElementById("routeId").value.trim().toUpperCase();
    const name = document.getElementById("routeName").value.trim();
    const pickup = document.getElementById("routePickup").value.trim();
    const time = document.getElementById("routeTime").value;

    const routes = getData("routes");

    if (routes.some(route => route.id.toLowerCase() === id.toLowerCase())) {
        showToast("This route ID already exists.");
        return;
    }

    if (!setData("routes", [...routes, { id, name, pickup, time }])) return;

    closeModal("routeModal");

    renderAll();

    showToast("Route added successfully.");
});

// ---------- Student Management ----------

function renderStudents(searchTerm = "") {
    const students = getData("students");

    const filtered = students.filter(student =>
        [student.id, student.name, student.email, student.route]
            .some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    document.getElementById("studentTable").innerHTML = filtered.length
        ? filtered.map(student => `
            <tr>
                <td>${escapeHTML(student.id)}</td>
                <td>${escapeHTML(student.name)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>${escapeHTML(student.route)}</td>
                <td>
                    ${isAdmin()
                        ? `<button class="action-btn"
                            data-delete="students"
                            data-id="${escapeHTML(student.id)}">Delete</button>`
                        : "View only"}
                </td>
            </tr>
        `).join("")
        : emptyRow(5, "No students found.");
}

document.getElementById("studentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!requireAdmin()) return;

    const id = document.getElementById("newStudentId").value.trim();
    const name = document.getElementById("newStudentName").value.trim();
    const email = document.getElementById("newStudentEmail")
        .value.trim().toLowerCase();
    const route = document.getElementById("newStudentRoute").value;

    const students = getData("students");

    if (students.some(student =>
        student.id.toLowerCase() === id.toLowerCase() ||
        student.email.toLowerCase() === email
    )) {
        showToast("Student ID or email already exists.");
        return;
    }

    if (!setData("students", [...students, { id, name, email, route }])) return;

    closeModal("studentModal");

    renderAll();

    showToast("Student record added successfully.");
});

// ---------- Driver Management ----------

function renderDrivers() {
    const drivers = getData("drivers");

    document.getElementById("driverTable").innerHTML = drivers.length
        ? drivers.map(driver => `
            <tr>
                <td>${escapeHTML(driver.id)}</td>
                <td>${escapeHTML(driver.name)}</td>
                <td>${escapeHTML(driver.phone)}</td>
                <td>${escapeHTML(driver.bus || "Not assigned")}</td>
                <td>
                    ${isAdmin()
                        ? `<button class="action-btn"
                            data-delete="drivers"
                            data-id="${escapeHTML(driver.id)}">Delete</button>`
                        : "View only"}
                </td>
            </tr>
        `).join("")
        : emptyRow(5, "No drivers found.");
}

document.getElementById("driverForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!requireAdmin()) return;

    const id = document.getElementById("newDriverId").value.trim();
    const name = document.getElementById("newDriverName").value.trim();
    const phone = document.getElementById("newDriverPhone").value.trim();
    const bus = document.getElementById("newDriverBus").value;

    const drivers = getData("drivers");

    if (drivers.some(driver =>
        driver.id.toLowerCase() === id.toLowerCase()
    )) {
        showToast("This driver ID already exists.");
        return;
    }

    if (!setData("drivers", [...drivers, {
        id,
        name,
        phone,
        bus
    }])) return;

    closeModal("driverModal");

    renderAll();

    showToast("Driver added successfully.");
});

// ---------- Attendance ----------

function renderAttendance() {
    const attendance = getData("attendance")
        .slice()
        .reverse();

    document.getElementById("attendanceTable").innerHTML =
        attendance.length
            ? attendance.map(record => `
                <tr>
                    <td>${escapeHTML(record.date)}</td>
                    <td>${escapeHTML(record.student)}</td>
                    <td>${escapeHTML(record.bus)}</td>
                    <td>${makeBadge(record.status)}</td>
                </tr>
            `).join("")
            : emptyRow(4, "No attendance records yet.");

    refreshSelectOptions();
}

document.getElementById("attendanceForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const studentId = document.getElementById("attendanceStudent").value;
    const busId = document.getElementById("attendanceBus").value;
    const status = document.getElementById("attendanceStatus").value;

    const students = getData("students");
    const buses = getData("buses");

    const student = students.find(item => item.id === studentId);
    const bus = buses.find(item => item.id === busId);

    if (!student || !bus) {
        showToast("Please select a valid student and bus.");
        return;
    }

    const attendance = getData("attendance");

    const alreadyRecorded = attendance.some(record =>
        record.studentId === studentId &&
        record.date === todayString()
    );

    if (alreadyRecorded) {
        showToast("Attendance has already been recorded for this student today.");
        return;
    }

    const newRecord = {
        date: todayString(),
        studentId: student.id,
        student: student.name,
        bus: bus.id,
        status
    };

    if (!setData("attendance", [...attendance, newRecord])) return;

    document.getElementById("attendanceForm").reset();

    renderAttendance();

    showToast("Attendance saved successfully.");
});

// ---------- Notifications ----------

function renderNotifications() {
    const notifications = getData("notifications")
        .slice()
        .reverse();

    const html = notifications.length
        ? notifications.map(notification => `
            <div class="notification-item">
                <h4>${escapeHTML(notification.title)}</h4>
                <p>${escapeHTML(notification.message)}</p>
                <small>${formatDate(notification.date)}</small>
                ${isAdmin()
                    ? `<button class="action-btn"
                        data-delete="notifications"
                        data-id="${escapeHTML(notification.id)}"
                        style="margin-top:10px">Delete</button>`
                    : ""}
            </div>
        `).join("")
        : "<p>No notifications available.</p>";

    document.getElementById("allNotifications").innerHTML = html;
}

document.getElementById("notificationForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        if (!requireAdmin()) return;

        const title = document.getElementById("notificationTitle")
            .value.trim();

        const message = document.getElementById("notificationText")
            .value.trim();

        if (!title || !message) {
            showToast("Enter both the title and message.");
            return;
        }

        const notifications = getData("notifications");

        const newNotification = {
            id: "N" + Date.now(),
            title,
            message,
            date: new Date().toISOString()
        };

        if (!setData("notifications", [
            ...notifications,
            newNotification
        ])) return;

        this.reset();

        renderAll();

        showToast("Notification published successfully.");
    });

// ---------- Delete Records ----------

document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-delete]");

    if (!button) return;

    if (!requireAdmin()) return;

    const key = button.dataset.delete;
    const id = button.dataset.id;

    const keyMap = {
        buses: "id",
        routes: "id",
        students: "id",
        drivers: "id",
        notifications: "id"
    };

    if (!keyMap[key]) return;

    const data = getData(key);

    const record = data.find(item =>
        String(item[keyMap[key]]) === String(id)
    );

    if (!record) return;

    // Prevent deletion of records that are currently referenced.
    if (key === "routes") {
        const inUse = getData("buses").some(bus =>
            bus.route === record.name
        ) || getData("students").some(student =>
            student.route === record.name
        );

        if (inUse) {
            showToast("This route is assigned to a bus or student.");
            return;
        }
    }

    if (key === "buses") {
        const assigned = getData("drivers").some(driver =>
            driver.bus === id
        ) || getData("attendance").some(item =>
            item.bus === id
        );

        if (assigned) {
            showToast("This bus is referenced by a driver or attendance record.");
            return;
        }
    }

    if (!confirm(`Are you sure you want to delete "${id}"?`)) {
        return;
    }

    if (!setData(key, data.filter(item =>
        String(item[keyMap[key]]) !== String(id)
    ))) return;

    renderAll();

    showToast("Record deleted successfully.");
});

// ---------- Search ----------

document.getElementById("busSearch").addEventListener("input", function () {
    renderBuses(this.value);
});

document.getElementById("studentSearch").addEventListener("input", function () {
    renderStudents(this.value);
});

// ---------- Dropdown Options ----------

function refreshSelectOptions() {
    const routes = getData("routes");
    const buses = getData("buses");
    const students = getData("students");

    const routeOptions = routes.map(route => `
        <option value="${escapeHTML(route.name)}">
            ${escapeHTML(route.name)}
        </option>
    `).join("");

    document.getElementById("busRoute").innerHTML =
        '<option value="">Select route</option>' + routeOptions;

    document.getElementById("newStudentRoute").innerHTML =
        '<option value="">Select route</option>' + routeOptions;

    document.getElementById("attendanceStudent").innerHTML =
        '<option value="">Select student</option>' +
        students.map(student => `
            <option value="${escapeHTML(student.id)}">
                ${escapeHTML(student.name)} (${escapeHTML(student.id)})
            </option>
        `).join("");

    document.getElementById("attendanceBus").innerHTML =
        '<option value="">Select bus</option>' +
        buses.map(bus => `
            <option value="${escapeHTML(bus.id)}">
                ${escapeHTML(bus.id)} - ${escapeHTML(bus.route)}
            </option>
        `).join("");

    document.getElementById("newDriverBus").innerHTML =
        '<option value="">Not assigned</option>' +
        buses.map(bus => `
            <option value="${escapeHTML(bus.id)}">
                ${escapeHTML(bus.id)}
            </option>
        `).join("");
}

// ---------- Render Helpers ----------

function emptyRow(columns, message) {
    return `
        <tr>
            <td colspan="${columns}"
                style="text-align:center;color:#64748b;padding:25px">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}

function renderSection(section) {
    switch (section) {
        case "dashboard":
            renderDashboard();
            break;

        case "buses":
            renderBuses(document.getElementById("busSearch").value);
            break;

        case "routes":
            renderRoutes();
            break;

        case "students":
            renderStudents(document.getElementById("studentSearch").value);
            break;

        case "drivers":
            renderDrivers();
            break;

        case "attendance":
            renderAttendance();
            break;

        case "notifications":
            renderNotifications();
            break;
    }
}

function renderAll() {
    refreshSelectOptions();
    renderDashboard();
    renderBuses(document.getElementById("busSearch").value);
    renderRoutes();
    renderStudents(document.getElementById("studentSearch").value);
    renderDrivers();
    renderAttendance();
    renderNotifications();
}

// ---------- Restore Session ----------

document.addEventListener("DOMContentLoaded", function () {
    const savedSession = loadData(STORAGE_KEYS.session, null);

    document.getElementById("footerYear").textContent =
        new Date().getFullYear();

    if (savedSession && savedSession.email && savedSession.role) {
        // Confirm the saved session still corresponds to a registered user.
        const users = getData("users");

        const registeredUser = users.find(user =>
            user.email.toLowerCase() === savedSession.email.toLowerCase() &&
            user.role === savedSession.role
        );

        if (registeredUser) {
            currentUser = {
                name: registeredUser.name,
                email: registeredUser.email,
                role: registeredUser.role
            };

            openApplication();
            return;
        }

        localStorage.removeItem(STORAGE_KEYS.session);
    }

    showLogin();
});
// ==========================================
// LIVE BUS LOCATION TRACKING
// Add this code at the end of script.js
// ==========================================

let busLocationWatchId = null;

function initializeBusTracking() {
    const busSelect = document.getElementById("trackingBus");

    if (!busSelect) return;

    const buses = getData("buses");
    const previousValue = busSelect.value;

    busSelect.innerHTML =
        '<option value="">Select a bus</option>' +
        buses.map(bus => `
            <option value="${escapeHTML(bus.id)}">
                ${escapeHTML(bus.id)} - ${escapeHTML(bus.route)}
            </option>
        `).join("");

    if (buses.some(bus => bus.id === previousValue)) {
        busSelect.value = previousValue;
    }
}

function updateTrackingStatus(message) {
    const status = document.getElementById("trackingStatus");

    if (status) {
        status.textContent = message;
    }
}

function startBusTracking() {
    if (!currentUser) {
        showToast("Please log in first.");
        return;
    }

    const selectedBus = document.getElementById("trackingBus").value;

    if (!selectedBus) {
        showToast("Please select a bus first.");
        return;
    }

    if (!navigator.geolocation) {
        updateTrackingStatus("Location unsupported");
        showToast("Your browser does not support geolocation.");
        return;
    }

    if (busLocationWatchId !== null) {
        navigator.geolocation.clearWatch(busLocationWatchId);
        busLocationWatchId = null;
    }

    updateTrackingStatus("Requesting location...");

    busLocationWatchId = navigator.geolocation.watchPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            document.getElementById("latitude").textContent =
                latitude.toFixed(6);

            document.getElementById("longitude").textContent =
                longitude.toFixed(6);

            document.getElementById("accuracy").textContent =
                Math.round(accuracy) + " metres";

            document.getElementById("lastUpdated").textContent =
                new Date(position.timestamp).toLocaleTimeString();

            const mapURL =
                "https://www.openstreetmap.org/export/embed.html?bbox=" +
                (longitude - 0.005) + "%2C" +
                (latitude - 0.005) + "%2C" +
                (longitude + 0.005) + "%2C" +
                (latitude + 0.005) +
                "&layer=mapnik&marker=" +
                latitude + "%2C" + longitude;

            document.getElementById("busMap").src = mapURL;

            updateTrackingStatus("Location received");

            // Save the latest location for this bus in this browser.
            const locations = loadData("campusride_bus_locations", {});

            locations[selectedBus] = {
                latitude,
                longitude,
                accuracy,
                updatedAt: new Date(position.timestamp).toISOString()
            };

            saveData("campusride_bus_locations", locations);
        },

        function (error) {
            let message = "Unable to get location.";

            if (error.code === 1) {
                message = "Location permission denied. Allow access in your browser.";
            } else if (error.code === 2) {
                message = "Your device location is unavailable.";
            } else if (error.code === 3) {
                message = "Location request timed out. Try again.";
            }

            updateTrackingStatus("Tracking error");
            showToast(message);

            if (busLocationWatchId !== null) {
                navigator.geolocation.clearWatch(busLocationWatchId);
                busLocationWatchId = null;
            }
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000
        }
    );

    updateTrackingStatus("Tracking requested");
}

function stopBusTracking() {
    if (busLocationWatchId !== null) {
        navigator.geolocation.clearWatch(busLocationWatchId);
        busLocationWatchId = null;
    }

    updateTrackingStatus("Tracking stopped");
    showToast("Location tracking stopped.");
}

document.getElementById("startTracking")
    .addEventListener("click", startBusTracking);

document.getElementById("stopTracking")
    .addEventListener("click", stopBusTracking);

// Add the tracking page to the existing navigation system.
sections.push("tracking");
sectionTitles.tracking = "Live Bus Tracking";

// Extend the existing renderSection function.
const originalRenderSection = renderSection;

renderSection = function (section) {
    if (section === "tracking") {
        initializeBusTracking();
        return;
    }

    originalRenderSection(section);
};