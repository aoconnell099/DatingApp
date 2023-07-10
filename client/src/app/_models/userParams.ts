import { User } from "./user";

export class UserParams {
    gender: string;
    minAge = 18;
    maxAge = 99;
    pageNumber = 0;
    pageSize = 6;
    orderBy = 'lastActive';
    concertFilter?: boolean;
    distance = 10;
    latitude = 0.0;
    longitude = 0.0;

    constructor(user: User) {
        this.gender = user.gender === 'female' ? 'male' : 'female';
        this.concertFilter = false;
    }
}