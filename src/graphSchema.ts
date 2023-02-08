export const typeDefs = `#graphql
  input DepartmentInput {
    name: String!
  }

  input PersonInput {
    firstName: String
    lastName: String
    jobTitle: String
    departmentId: ID
    managerId: ID
  }

  type DepartmentWithRelationships {
    name: String!
    id: ID!
    people: [PersonWithRelationships]!
  }

  type PersonWithRelationships {
    id: ID!
    firstName: String!
    lastName: String!
    jobTitle: String!
    departmentId: ID!
    managerId: ID
    manager: PersonWithRelationships
    reports: [PersonWithRelationships]!
    department: DepartmentWithRelationships!
  }

  type Query {
    departments: [DepartmentWithRelationships]!
    department(id: ID!): DepartmentWithRelationships
    people: [PersonWithRelationships]!
    person(id: ID!): PersonWithRelationships
  }

  type Mutation {
    updateDepartment(id: ID!, department: DepartmentInput!): DepartmentWithRelationships
    updatePerson(id: ID!, person: PersonInput!): PersonWithRelationships
  }
`;
