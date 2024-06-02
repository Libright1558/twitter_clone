# twitter_clone
The purpose of this project is to serve as my personal practice for planning system design of a backend server. This project utilizes frameworks and database management systems such as node.js, express, PostgreSQL, redis, etc.
### Database Schema
![postgresql diagram](https://github.com/Libright1558/twitter_clone/assets/19789411/55d8234a-ad3d-4040-84d0-67b40d7fe719)


---
### Redis Schema
WIP

---
### ToDo
- [x] Implement and fix redis schema to handle the like and the retweet event from users
- [x] Deal with the consistency in redis cache (partially solved)
- [ ] Use docker to build and package the project
- [ ] Use react and next.js framework to remake frontend side of the project
- [ ] Use nginx to balance the loading of multiple server nodes
- [ ] Prevent cache avalanche in redis and database
