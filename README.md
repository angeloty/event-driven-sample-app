# 10KC-BOOTCAMP

# SOLUTION

- Postman Collection is shared as part of the code

- Tech Stack

  - NodeJS(v14)
    - Express
    - Typescript
    - Mongoose
    - Reflect-metadata
    - Jsonwebtoken
    - Class Validator
    - Class Transformer
    - Jest
    - Supertest
  - MongoDB (v4.2)
  - Redis (v5)
    - Pub/Sub
  - Docker
    - Docker Compose

- Practices

  - Monorepo
  - Microservice
  - Event-Driven Architecture
  - Dependency Injection(Decorators)
  - Unit Tests(Event Simulation)
  - Redis PubSub
  - Adapter Pattern
  - Reflection

- INSTALLATION
  - Requirements
    - Docker
  - Commands
    > docker compose up -d
- TEST
  - Note: Databas and Redis must be online, and apps(users and posts microservices) must be offline.
  - Post Microservice
    > docker stop 10kc_posts_api 10kc_users_api
    > npm run test:posts
  - User Microservice
    > npm run test:users

# ARCHITECTURE

       _______________________________________________________________
      |                                                               |
      |                         Core Library                          |
      |_______________________________________________________________|
             ||                                             ||
             ||                                             ||
     __________________   ________________________    _________________
    |                  | | CACHE / EVENT MANAGER  |  |                  |
    |  Posts/Comments  | |                        |  |    User/Auth     |
    | - Post Management| <====> REDIS PUB/SUB <====> | - User Management|
    | - File Management|                             | - Authentication |
    | - Comments       |                             |                  |
    |__________________|                             |__________________|
             ||                                             ||
       _______________________________________________________________
      |                                                               |
      |                 Database Manager (MongoDB)                    |
      |_______________________________________________________________|

# Bootcamp - Backend

Stack Node.js, Express, and MongoDB. All of these pieces work together to make up the stable, scalable, and maintainable web application.

# Your Challenge

- Create a simple photo sharing application backend using all of the frameworks and tools you just learned. The backend API must:
  - Support adding and deleting photos
  - Fetch all photos for a user.
  - Allow users to post publicly or privately.
  - Store any uploaded images in MongoDB (MongoDB provides access to a free database) - Allow comments on the photos by authenticated users.
  - The server should be written using Node.js and Express.js
  - The database should be built with MongoDB and Mongoose
  - Use Git for source control on a public repository (ideally GitHub)
- The backend must demonstrate the following:
  - User authentication and authorization protected routes
  - Response pagination
  - Request validation
  - Unit testing with Jest should be demonstrated (code coverage does not need to be 100%, just enough to show understanding)