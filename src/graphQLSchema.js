import merge from 'lodash.merge';
import GraphQLJSON from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { mergeSchemas } from './utilities';

import {
    studentsMutations,
    studentsQueries,
    studentsTypeDef
} from './students/typeDefs';

import {
    coursesMutations,
    coursesQueries,
    coursesTypeDef
} from './courses/typeDefs';

import {
    gradesMutations,
    gradesQueries,
    gradesTypeDef
} from './grades/typeDefs';

import {
    authMutations,
    authTypeDef
} from './auth/typeDefs';

import studentsResolvers from './students/resolvers';
import coursesResolvers from './courses/resolvers';
import gradesResolvers from './grades/resolvers';
import authResolvers from './auth/resolvers';

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
    [
        'scalar JSON',
        studentsTypeDef,
        coursesTypeDef,
        gradesTypeDef,
        authTypeDef
    ],
    [
        studentsQueries,
        coursesQueries,
        gradesQueries
    ],
    [
        studentsMutations,
        coursesMutations,
        gradesMutations,
        authMutations
    ]
);

// Generate the schema object from your types definition.
export default makeExecutableSchema({
    typeDefs: mergedTypeDefs,
    resolvers: merge(
        { JSON: GraphQLJSON }, // allows scalar JSON
        studentsResolvers,
        coursesResolvers,
        gradesResolvers,
        authResolvers
    )
});
