# Skatemaps

**Skatemaps** is a full-stack, interactive web application designed for locating, pinning, and discussing local skate spots. Built over a 13-week capstone development cycle, the application features dynamic spatial mapping, relational data management, role-based moderation, and secure user authentication.

## Features

* **Interactive Mapping:** Powered by Leaflet.js and OpenStreetMap. Click anywhere on the map to extract spatial coordinates and drop a new pin.
* **Debounced Geocoding Search:** Features a live autocomplete search bar using the Nominatim API. Includes custom 500ms debounce logic to prevent rate-limiting while flying the map to searched cities.
* **File System Routing:** Users can attach `.jpg` or `.png` images to their spots. Images are saved to a local directory and served to the frontend via a custom Spring Boot `WebConfig`.
* **Live Comment Threads:** Each spot features an isolated, relational comment thread to discuss spot conditions.
* **Role-Based Authorization:** Implements a multi-tiered user system (`USER`, `MODERATOR`, `ADMIN`). Higher-tier users have dynamic access to UI features to delete spots, moderate comments, and manage the database.
* **Admin Dashboard:** A dedicated control panel for Admins to view the user base and promote standard users to Moderators.
* **Secure Authentication:** Features MVP session management coupled with Spring Security and **BCrypt Password Hashing** to ensure no plaintext passwords are ever stored in the database.

## Tech Stack

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

## Local Setup & Installation

To run this project locally, you will need **Java 17+**, **Maven**, and **MySQL Workbench** installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/jesse00005/skatemaps.git
cd skatemaps
```

### 2. Configure the Database
Open MySQL Workbench and run the following command to create the empty database:
```sql
CREATE DATABASE skatemaps;
```

Next, open the `src/main/resources/application.properties` file in your IDE and update the database credentials to match your local MySQL root password:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skatemaps
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Hibernate will automatically generate the tables on boot
spring.jpa.hibernate.ddl-auto=update
```

### 3. Run the Application
You can run the application directly from your IDE by executing the `SkatemapsApplication.java` file, or via the terminal using Maven:
```bash
mvn spring-boot:run
```

### 4. Access the App
Once the Spring Boot server boots up (usually on port 8080), open your browser and navigate to:
```text
http://localhost:8080
```

---

## Default Roles & Testing

When you first launch the app, the database will be empty. 
1. Click **Sign Up** to create your first user account.
2. To test the moderation features, open MySQL Workbench and manually change your user's role from `USER` to `ADMIN` in the `users` table. 
3. Log out and log back in on the frontend to access the Admin Panel and the red deletion tools.

---

## Architecture Notes
* **Monolith Structure:** To streamline development during the 13-week sprint cycle, the frontend is packaged directly inside the Spring Boot `src/main/resources/static` directory rather than running a separate Node.js server.
* **JSON Recursion Handling:** Addressed bidirectional infinite loops between `User` and `Comment` entities using Jackson `@JsonIgnoreProperties` to safely serialize relational data for the frontend.
