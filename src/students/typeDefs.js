export const studentsTypeDef = `
type Student {
    id: Int!
    name: String!
    lastname: String!
    email: String!
    code: Int!
}

input StudentInput {
    name: String!
    lastname: String!
    email: String!
    code: Int!
}
`;

export const studentsQueries = `
    allStudents: [Student]!
    studentById(id: Int!): Student!
`;

export const studentsMutations = `
    createStudent(student: StudentInput!): Student!
    deleteStudent(id: Int!): Student!
    updateStudent(id: Int!, student: StudentInput!): Student!
`;
