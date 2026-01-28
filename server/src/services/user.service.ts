import type { User } from "../core/domain/user.domain.js";
import type { UserRepository } from "../repositories/user.repo.js";

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    public async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findUserById(id);
    }
    
    

}   