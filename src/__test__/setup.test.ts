import assert from 'assert';
import {initAppContext, loadInitAppDataFromFile} from '../setup';
import {AppContext} from '../types';

let context: AppContext;

beforeAll(async () => {
  context = await initAppContext();
});

afterAll(async () => {
  await context?.data?.dispose();
});

describe('setup', () => {
  test('loadInitAppDataFromFile', () => {
    assert(context);
    const data = loadInitAppDataFromFile(context);
    expect(data.departments.length).toBeGreaterThan(0);
    expect(data.people.length).toBeGreaterThan(0);
  });

  test('loadInitAppDataIntoDB', async () => {
    assert(context);
    await loadInitAppDataFromFile(context);
    const [departments, people] = await Promise.all([
      context.data.departments.getItems(),
      context.data.people.getItems(),
    ]);
    expect(departments.length).toBeGreaterThan(0);
    expect(people.length).toBeGreaterThan(0);
  });
});
