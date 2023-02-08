import assert = require('assert');
import {faker} from '@faker-js/faker';
import {GraphQLResolveInfo} from 'graphql';
import {
  getDepartment,
  getPerson,
  listDepartments,
  listPeople,
  updateDepartment,
  updatePerson,
} from '../endpoints';
import {appMessages} from '../messages';
import {initAppContext, loadInitAppDataFromFile} from '../setup';
import {containsEveryItemIn} from '../testUtils';
import {
  AppContext,
  AppInitializationData,
  Department,
  DepartmentWithRelationships,
  Person,
  PersonWithRelationships,
} from '../types';

let context: AppContext, appData: AppInitializationData;
const kParent = undefined,
  kArgs = undefined,
  kInfo = {} as GraphQLResolveInfo;

beforeAll(async () => {
  context = await initAppContext();
  appData = loadInitAppDataFromFile(context);
});

afterAll(async () => {
  await context?.data?.dispose();
});

describe('endpoints', () => {
  test('listDepartment', async () => {
    assert(context);
    const result = await listDepartments(kParent, kArgs, context, kInfo);
    containsEveryItemIn(result, appData.departments, item => item.id);
    await checkDepartmentListRelationships(result);
  });

  test('getDepartment', async () => {
    assert(context);
    const departmentToUpdate = appData.departments[0];
    const result = await getDepartment(
      kParent,
      {id: departmentToUpdate.id},
      context,
      kInfo
    );
    expect(result).toMatchObject(departmentToUpdate);
    await checkDepartmentRelationships(result);
  });

  test('listPeople', async () => {
    assert(context);
    const result = await listPeople(kParent, kArgs, context, kInfo);
    containsEveryItemIn(result, appData.people, item => item.id);
    await checkPeopleRelationships(result);
  });

  test('getPerson', async () => {
    assert(context);
    const personToUpdate = appData.people[0];
    if (!personToUpdate) {
      return;
    }

    const result = await getPerson(
      kParent,
      {id: personToUpdate.id},
      context,
      kInfo
    );
    expect(result).toMatchObject(personToUpdate);
    await checkPersonRelationships(result);
  });

  test('updateDepartment', async () => {
    assert(context);
    const departmentToUpdate = appData.departments[0];
    if (!departmentToUpdate) {
      return;
    }

    const update: Partial<Department> = {name: faker.commerce.department()};
    const result = await updateDepartment(
      kParent,
      {id: departmentToUpdate.id, department: update},
      context,
      kInfo
    );
    expect(result).toMatchObject(update);
    const department = await getDepartment(
      kParent,
      {id: departmentToUpdate.id},
      context,
      kInfo
    );
    assert(department);
    expect(result).toMatchObject(department);
    await checkDepartmentRelationships(result);
  });

  test('updateDepartment fails if department with name exists', async () => {
    assert(context);
    const [departmentToUpdate, departmentForNameConflict] = appData.departments;
    if (!departmentToUpdate || !departmentForNameConflict) {
      return;
    }

    try {
      const update: Partial<Department> = {
        name: departmentForNameConflict.name,
      };
      await updateDepartment(
        kParent,
        {id: departmentToUpdate.id, department: update},
        context,
        kInfo
      );
      assert.fail('updateDepartment should fail not pass');
    } catch (error: unknown) {
      assert(error instanceof Error);
      expect(error.message).toBe(
        appMessages.departments.departmentExists(departmentForNameConflict.name)
      );
    }
  });

  test('updatePerson', async () => {
    assert(context);
    const personToUpdate = appData.people[0],
      newManager = appData.people.find(
        item =>
          item.id !== personToUpdate.managerId &&
          item.managerId !== personToUpdate?.id
      ),
      newDepartment = appData.departments.find(
        item => item.id !== personToUpdate.departmentId
      );

    if (!personToUpdate) {
      return;
    }

    const update: Partial<Person> = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      jobTitle: faker.name.jobTitle(),
      departmentId: newDepartment?.id,
      managerId: newManager?.id,
    };
    const result = await updatePerson(
      kParent,
      {id: personToUpdate.id, person: update},
      context,
      kInfo
    );
    expect(result).toMatchObject(update);
    const person = await getPerson(
      kParent,
      {id: personToUpdate.id},
      context,
      kInfo
    );
    assert(person);
    expect(result).toMatchObject(person);
    await checkPersonRelationships(result);
  });

  test('updatePerson fails if department does not exist', async () => {
    assert(context);
    const personToUpdate = appData.people[0];
    if (!personToUpdate) {
      return;
    }

    try {
      const update: Partial<Person> = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        jobTitle: faker.name.jobTitle(),
        departmentId: faker.datatype.uuid(),
      };
      await updatePerson(
        kParent,
        {id: personToUpdate.id, person: update},
        context,
        kInfo
      );
    } catch (error: unknown) {
      assert(error instanceof Error);
      expect(error.message).toBe(appMessages.departments.departmentNotFound);
    }
  });

  test('updatePerson fails if manager does not exist', async () => {
    assert(context);
    const personToUpdate = appData.people[0];
    if (!personToUpdate) {
      return;
    }

    try {
      const update: Partial<Person> = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        jobTitle: faker.name.jobTitle(),
        managerId: faker.datatype.uuid(),
      };
      await updatePerson(
        kParent,
        {id: personToUpdate.id, person: update},
        context,
        kInfo
      );
    } catch (error: unknown) {
      assert(error instanceof Error);
      expect(error.message).toBe(appMessages.people.managerNotFound);
    }
  });
});

async function checkDepartmentPeople(
  department: DepartmentWithRelationships | null
) {
  if (!department) {
    return;
  }

  const people = await department.people(department, kArgs, context, kInfo);
  people.forEach(nextPerson =>
    expect(nextPerson.departmentId).toBe(department.id)
  );
}

async function checkPersonManager(person: PersonWithRelationships | null) {
  if (!person) {
    return;
  }

  const manager = await person.manager(person, kArgs, context, kInfo);
  if (person.managerId) {
    expect(manager?.id).toBe(person.managerId);
  } else {
    expect(manager).toBeNull();
  }
}

async function checkPersonReports(person: PersonWithRelationships | null) {
  if (!person) {
    return;
  }

  const people = await person.reports(person, kArgs, context, kInfo);
  people.forEach(report => expect(report.managerId).toBe(person.id));
}

async function checkPersonDepartment(person: PersonWithRelationships | null) {
  if (!person) {
    return;
  }

  const department = await person.department(person, kArgs, context, kInfo);
  if (person.departmentId) {
    expect(department?.id).toBe(person.departmentId);
  } else {
    expect(department).toBeNull();
  }
}

async function checkPersonRelationships(
  person: PersonWithRelationships | null
) {
  await Promise.all([
    checkPersonDepartment(person),
    checkPersonManager(person),
    checkPersonReports(person),
  ]);
}

async function checkDepartmentRelationships(
  department: DepartmentWithRelationships | null
) {
  await Promise.all([checkDepartmentPeople(department)]);
}

async function checkPeopleRelationships(people: PersonWithRelationships[]) {
  await Promise.all(people.map(checkPersonRelationships));
}

async function checkDepartmentListRelationships(
  departments: DepartmentWithRelationships[]
) {
  await Promise.all(departments.map(checkDepartmentRelationships));
}
