import {
  Department,
  DepartmentsDataLayer,
  PeopleDataLayer,
  Person,
  ResourceDataLayer,
  StringFields,
} from './types';

export class InMemoryDataLayer<T extends object>
  implements ResourceDataLayer<T>
{
  protected data: T[] = [];

  insert(items: T[]) {
    this.data = this.data.concat(items);
  }

  getItems() {
    return this.data;
  }

  getItemByField<K extends keyof T>(field: K, value: T[K]): T | null {
    const index = this.getItemIndexByField(field, value);
    if (index === -1) {
      return null;
    }
    return this.data[index];
  }

  getItemListByField<K extends keyof T>(field: K, value: T[K]): T[] {
    return this.data.filter(item => {
      return item[field] === value;
    });
  }

  getItemByRegex<K extends StringFields<T>>(field: K, value: RegExp): T | null {
    const item = this.data.find(item => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.match(value);
      }
      return false;
    });
    return item ?? null;
  }

  updateByField<K extends keyof T>(
    field: K,
    value: T[K],
    update: Partial<T>
  ): T | null {
    const index = this.getItemIndexByField(field, value);
    if (index === -1) {
      return null;
    }
    this.data[index] = {...this.data[index], ...update};
    return this.data[index];
  }

  protected getItemIndexByField<K extends keyof T>(field: K, value: T[K]) {
    return this.data.findIndex(item => item[field] === value);
  }
}

export class InMemoryDepartmentsDataLayer
  extends InMemoryDataLayer<Department>
  implements DepartmentsDataLayer {}

export class InMemoryPeopleDataLayer
  extends InMemoryDataLayer<Person>
  implements PeopleDataLayer {}
