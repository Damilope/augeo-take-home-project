export const appMessages = {
  departments: {
    departmentNotFound: 'Department not found.',
    departmentExists(name: string) {
      return `Department with name ${name} exists.`;
    },
  },
  people: {
    personNotFound: 'Person not found.',
    managerNotFound: 'Manager not found.',
  },
};
