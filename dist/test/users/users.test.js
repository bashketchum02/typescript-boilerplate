"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../../app"));
const supertest_1 = __importDefault(require("supertest"));
const chai_1 = require("chai");
const shortid_1 = __importDefault(require("shortid"));
const mongoose_1 = __importDefault(require("mongoose"));
let firstUserIdTest = '';
const firstUserBody = {
    email: `marcos.henrique+${shortid_1.default.generate()}@toptal.com`,
    password: 'Sup3rSecret!23',
};
let accessToken = '';
let refreshToken = '';
const newFirstName = 'Jose';
const newFirstName2 = 'Paulo';
const newLastName2 = 'Faraco';
describe('users and auth endpoints', function () {
    let request;
    before(function () {
        request = supertest_1.default.agent(app_1.default);
    });
    after(function (done) {
        // shut down the Express.js server, close our MongoDB connection, then tell Mocha we're done:
        app_1.default.close(() => {
            mongoose_1.default.connection.close(done);
        });
    });
    it('should allow a POST to /users', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield request.post('/users').send(firstUserBody);
            (0, chai_1.expect)(res.status).to.equal(201);
            (0, chai_1.expect)(res.body).not.to.be.empty;
            (0, chai_1.expect)(res.body).to.be.an('object');
            (0, chai_1.expect)(res.body.id).to.be.a('string');
            firstUserIdTest = res.body.id;
        });
    });
    it('should allow a POST to /auth', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield request.post('/auth').send(firstUserBody);
            (0, chai_1.expect)(res.status).to.equal(201);
            (0, chai_1.expect)(res.body).not.to.be.empty;
            (0, chai_1.expect)(res.body).to.be.an('object');
            (0, chai_1.expect)(res.body.accessToken).to.be.a('string');
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });
    });
    it('should allow a GET from /users/:userId with an access token', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield request
                .get(`/users/${firstUserIdTest}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).not.to.be.empty;
            (0, chai_1.expect)(res.body).to.be.an('object');
            (0, chai_1.expect)(res.body._id).to.be.a('string');
            (0, chai_1.expect)(res.body._id).to.equal(firstUserIdTest);
            (0, chai_1.expect)(res.body.email).to.equal(firstUserBody.email);
        });
    });
    describe('with a valid access token', function () {
        it('should allow a GET from /users', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield request
                    .get(`/users`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send();
                (0, chai_1.expect)(res.status).to.equal(403);
            });
        });
        it('should disallow a PATCH to /users/:userId', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield request
                    .patch(`/users/${firstUserIdTest}`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({
                    firstName: newFirstName,
                });
                (0, chai_1.expect)(res.status).to.equal(403);
            });
        });
        it('should disallow a PUT to /users/:userId with an nonexistent ID', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield request
                    .put(`/users/i-do-not-exist`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({
                    email: firstUserBody.email,
                    password: firstUserBody.password,
                    firstName: 'Marcos',
                    lastName: 'Silva',
                    permissionFlags: 256,
                });
                (0, chai_1.expect)(res.status).to.equal(404);
            });
        });
        it('should disallow a PUT to /users/:userId trying to change the permission flags', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield request
                    .put(`/users/${firstUserIdTest}`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({
                    email: firstUserBody.email,
                    password: firstUserBody.password,
                    firstName: 'Marcos',
                    lastName: 'Silva',
                    permissionFlags: 256,
                });
                (0, chai_1.expect)(res.status).to.equal(400);
                (0, chai_1.expect)(res.body.errors).to.be.an('array');
                (0, chai_1.expect)(res.body.errors).to.have.length(1);
                (0, chai_1.expect)(res.body.errors[0]).to.equal('User cannot change permission flags');
            });
        });
        it('should allow a PUT to /users/:userId/permissionFlags/2 for testing', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield request
                    .put(`/users/${firstUserIdTest}/permissionFlags/2`)
                    .set({ Authorization: `Bearer ${accessToken}` })
                    .send({});
                (0, chai_1.expect)(res.status).to.equal(204);
            });
        });
        describe('with a new set of permission flags', function () {
            it('should allow a POST to /auth/refresh-token', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const res = yield request
                        .post('/auth/refresh-token')
                        .set({ Authorization: `Bearer ${accessToken}` })
                        .send({ refreshToken });
                    (0, chai_1.expect)(res.status).to.equal(201);
                    (0, chai_1.expect)(res.body).not.to.be.empty;
                    (0, chai_1.expect)(res.body).to.be.an('object');
                    (0, chai_1.expect)(res.body.accessToken).to.be.a('string');
                    accessToken = res.body.accessToken;
                    refreshToken = res.body.refreshToken;
                });
            });
            it('should allow a PUT to /users/:userId to change first and last names', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const res = yield request
                        .put(`/users/${firstUserIdTest}`)
                        .set({ Authorization: `Bearer ${accessToken}` })
                        .send({
                        email: firstUserBody.email,
                        password: firstUserBody.password,
                        firstName: newFirstName2,
                        lastName: newLastName2,
                        permissionFlags: 2,
                    });
                    (0, chai_1.expect)(res.status).to.equal(204);
                });
            });
            it('should allow a GET from /users/:userId and should have a new full name', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const res = yield request
                        .get(`/users/${firstUserIdTest}`)
                        .set({ Authorization: `Bearer ${accessToken}` })
                        .send();
                    (0, chai_1.expect)(res.status).to.equal(200);
                    (0, chai_1.expect)(res.body).not.to.be.empty;
                    (0, chai_1.expect)(res.body).to.be.an('object');
                    (0, chai_1.expect)(res.body._id).to.be.a('string');
                    (0, chai_1.expect)(res.body.firstName).to.equal(newFirstName2);
                    (0, chai_1.expect)(res.body.lastName).to.equal(newLastName2);
                    (0, chai_1.expect)(res.body.email).to.equal(firstUserBody.email);
                    (0, chai_1.expect)(res.body._id).to.equal(firstUserIdTest);
                });
            });
            it('should allow a DELETE from /users/:userId', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const res = yield request
                        .delete(`/users/${firstUserIdTest}`)
                        .set({ Authorization: `Bearer ${accessToken}` })
                        .send();
                    (0, chai_1.expect)(res.status).to.equal(204);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvdXNlcnMvdXNlcnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUE0QjtBQUM1QiwwREFBa0M7QUFDbEMsK0JBQThCO0FBQzlCLHNEQUE4QjtBQUM5Qix3REFBZ0M7QUFFaEMsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLE1BQU0sYUFBYSxHQUFHO0lBQ2xCLEtBQUssRUFBRSxtQkFBbUIsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYTtJQUN6RCxRQUFRLEVBQUUsZ0JBQWdCO0NBQzdCLENBQUM7QUFFRixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDckIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM1QixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUM7QUFDOUIsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBRTlCLFFBQVEsQ0FBQywwQkFBMEIsRUFBRTtJQUNqQyxJQUFJLE9BQWlDLENBQUM7SUFDdEMsTUFBTSxDQUFDO1FBQ0gsT0FBTyxHQUFHLG1CQUFTLENBQUMsS0FBSyxDQUFDLGFBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLFVBQVUsSUFBSTtRQUNoQiw2RkFBNkY7UUFDN0YsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDWCxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRTs7WUFDaEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENB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