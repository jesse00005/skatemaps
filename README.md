# Skatemaps

**Skatemaps** is a full-stack, interactive web application designed for locating, pinning, and discussing local skate spots. Built over a 13-week capstone development cycle, the application features dynamic spatial mapping, relational data management, role-based moderation, and secure user authentication.

##  Features

* **Interactive Mapping:** Powered by Leaflet.js and OpenStreetMap. Click anywhere on the map to extract spatial coordinates and drop a new pin.
* **Debounced Geocoding Search:** Features a live autocomplete search bar using the Nominatim API. Includes custom 500ms debounce logic to prevent rate-limiting while flying the map to searched cities.
* **File System Routing:** Users can attach `.jpg` or `.png` images to their spots. Images are saved to a local directory and served to the frontend via a custom Spring Boot `WebConfig`.
* **Live Comment Threads:** Each spot features an isolated, relational comment thread to discuss spot conditions.
* **Role-Based Authorization:** Implements a multi-tiered user system (`USER`, `MODERATOR`, `ADMIN`). Higher-tier users have dynamic access to UI features to delete spots, moderate comments, and manage the database.
* **Admin Dashboard:** A dedicated control panel for Admins to view the user base and promote standard users to Moderators.
* **Secure Authentication:** Features MVP session management coupled with Spring Security and **BCrypt Password Hashing** to ensure no plaintext passwords are ever stored in the database.

##  Tech Stack

**Frontend:**
* HTML5 / CSS3 / Vanilla JavaScript
* Leaflet.js (Spatial Mapping)
* Fetch API (Asynchronous REST communication)

**Backend:**
* Java 17
* Spring Boot (Web, Data JPA)
* Spring Security (BCrypt Hashing)
* Hibernate / Jackson

**Database:**
* MySQL (Relational Mapping)

---

##  Local Setup & Installation

To run this project locally, you will need **Java 17+**, **Maven**, and **MySQL Workbench** installed on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/jesse00005/skatemaps.git](https://github.com/jesse00005/skatemaps.git)
cd skatemaps
