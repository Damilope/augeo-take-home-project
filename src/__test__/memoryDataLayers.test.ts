import {faker} from '@faker-js/faker';
import {InMemoryDataLayer} from '../memoryDataLayers';
import {Department, Person} from '../types';

const db = new InMemoryDataLayer<Department>();
const items: Department[] = [
  {id: faker.datatype.uuid(), name: faker.commerce.department()},
  {id: faker.datatype.uuid(), name: faker.commerce.department()},
];

beforeAll(async () => {
  await db.insert(items);
});

describe('InMemoryDataLayer', () => {
  test('insert', async () => {
    const db = new InMemoryDataLayer<Department>();
    const items: Department[] = [
      {id: faker.datatype.uuid(), name: faker.commerce.department()},
      {id: faker.datatype.uuid(), name: faker.commerce.department()},
    ];
    await db.insert(items);
    const savedItems = db.getItems();
    items.forEach(item => expect(savedItems).toContainEqual(item));
  });

  test('getItems', async () => {
    const savedItems = db.getItems();
    items.forEach(item => expect(savedItems).toContainEqual(item));
  });

  test('getItemByField', async () => {
    const item = db.getItemByField('id', items[0].id);
    expect(item).toMatchObject(items[0]);
  });

  test('getItemListByField', async () => {
    const peopleDb = new InMemoryDataLayer<Person>();
    const departmentId = faker.datatype.uuid();
    const items: Person[] = [
      seedPerson({departmentId}),
      seedPerson({departmentId}),
      seedPerson({departmentId}),
    ];
    peopleDb.insert(items);
    const result = peopleDb.getItemListByField('departmentId', departmentId);
    items.forEach(item => expect(result).toContainEqual(item));
  });

  test('getItemByRegex', async () => {
    const item = db.getItemByRegex('name', new RegExp(items[0].name, 'i'));
    expect(item).toMatchObject(items[0]);
  });

  test('updateByField', async () => {
    const update: Partial<Department> = {name: faker.commerce.department()};
    const item = db.updateByField('id', items[0].id, update);
    const updatedItem = db.getItemByField('id', items[0].id);
    expect(item).toMatchObject(update);
    expect(updatedItem).toMatchObject(update);
  });
});

function seedPerson(from: Partial<Person> = {}): Person {
  return {
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    jobTitle: faker.name.jobTitle(),
    departmentId: faker.datatype.uuid(),
    managerId: faker.datatype.uuid(),
    ...from,
  };
}
