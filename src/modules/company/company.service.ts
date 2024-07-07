import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateCompanyDto } from './dto/create-company.dto';
// import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyAdminDto } from './dto/company-admin.dto';
import { User } from '../users/entities/user.entity';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Transactional } from 'src/utils/decorator/transactional';
import { SOURCE_TYPE, STATUS_TYPE } from 'src/helpers/user.helpers';

@Injectable()
export class CompanyService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Transactional()
  async setupAdmin(companyAdminDto: CompanyAdminDto): Promise<Partial<User>> {
    const { name, email, password, companyName, companySize } = companyAdminDto;

    const names = { firstName: '', lastName: '' };
    if (name) {
      const [firstName, ...rest] = name.split(' ');
      names['firstName'] = firstName;
      if (rest.length != 0) {
        const lastName = rest.join(' ');
        names['lastName'] = lastName;
      }
    }
    const { firstName, lastName } = names;

    console.log('firstName::', firstName);
    console.log('lastName::', lastName);
    console.log('Manager:', this.companyRepository.manager); // Check if manager is defined

    try {
      // Step 1: Create Company
      const company = new Company({
        name: companyName,
        companySize: companySize,
      });
      await this.companyRepository.save(company);

      // Step 2: Create Group
      const group = new Group({
        name: 'Administrator',
        companyId: company.id,
      });
      await this.groupRepository.save(group);

      // Step 3: Create User
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        status: STATUS_TYPE.ACTIVE,
        source: SOURCE_TYPE.SIGNUP,
        companyId: company.id,
        groupId: group.id,
      });
      await this.usersRepository.save(user);

      console.log('All queries executed successfully!');

      return this.stripSensitiveFields(user);
      // return user;
    } catch (error) {
      console.error('Error executing queries:', error);
    }
  }

  // TODO: Move this to utils used in other place
  private stripSensitiveFields(user: User): Partial<User> {
    const sensitiveFields = ['password', 'status', 'source', 'avatarId'];
    for (const field of sensitiveFields) {
      delete user[field];
    }
    return user;
  }

  async remove(uuid: string): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { id: uuid },
    });
    // If company is not found, throw NotFoundException
    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    return this.companyRepository.delete(company.id);
  }
}
