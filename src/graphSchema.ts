export const typeDefs = `#graphql
  type Department {
    name: String!
    id: ID!
  }

  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    jobTitle: String!
    departmentId: ID!
    managerId: ID
  }

  type DepartmentRelationships {
    people: [Person]!
  }

  type PersonRelationships {
    manager: Person
    reports: [Person]!
    department: Department!
  }

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

  union QueryDepartmentResult = Department | DepartmentRelationships
  union QueryPersonResult = Person | PersonRelationships

  type Query {
    departments: [QueryDepartmentResult]!
    department(id: ID!): QueryDepartmentResult
    people: [QueryPersonResult]!
    person(id: ID!): QueryPersonResult
  }

  type Mutation {
    updateDepartment(id: ID!, department: DepartmentInput!): QueryDepartmentResult
    updatePerson(id: ID!, person: PersonInput!): QueryPersonResult
  }
`;
