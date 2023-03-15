import { UsersService } from '@algotech/angular';
import { UserDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'getUserName'
})
export class GetUserNamePipe implements PipeTransform {

    constructor(
        private userService: UsersService
    ) {}

    transform(userID: string): Observable<string> {
        if (!userID) {
            return of('');
        }
        return this.userService.get(userID).pipe(
            map((user: UserDto) => {
                const surname: string = user.firstName.substr(0, 1).toUpperCase();
                const lastname: string = user.lastName;
                return `${surname}. ${lastname}`;
            }),
        );
    }
}