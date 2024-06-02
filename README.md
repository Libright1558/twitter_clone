# twitter_clone
The purpose of this project is to serve as my personal practice for planning system design of a backend server. This project utilizes frameworks and database management systems such as node.js, express, PostgreSQL, redis, etc.
### Database Schema
![postgresql diagram](https://github.com/Libright1558/twitter_clone/assets/19789411/e06de026-aad3-4941-a21e-562bacf5d655)



---
### Redis Schema
![redisDiagram](https://github.com/Libright1558/twitter_clone/assets/19789411/d28446b2-a24b-4851-98b1-50f48ef09852)



---
### ToDo
- [x] Implement and fix redis schema to handle the like and the retweet event from users
- [x] Deal with the consistency in redis cache (partially solved)
- [ ] Use docker to build and package the project
- [ ] Use react and next.js framework to remake frontend side of the project
- [ ] Use nginx to balance the loading of multiple server nodes
- [ ] Prevent cache avalanche in redis and database
