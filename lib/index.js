'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var koaLogger = _interopDefault(require('koa-logger'));
var koaBody = _interopDefault(require('koa-bodyparser'));
var koaCors = _interopDefault(require('@koa/cors'));
var apolloServerKoa = require('apollo-server-koa');
var merge = _interopDefault(require('lodash.merge'));
var GraphQLJSON = _interopDefault(require('graphql-type-json'));
var graphqlTools = require('graphql-tools');
var request = _interopDefault(require('request-promise-native'));
var graphql = require('graphql');

/**
 * Creates a request following the given parameters
 * @param {string} url
 * @param {string} method
 * @param {object} [body]
 * @param {boolean} [fullResponse]
 * @return {Promise.<*>} - promise with the error or the response object
 */
async function generalRequest(url, method, body, fullResponse) {
	const parameters = {
		method,
		uri: encodeURI(url),
		body,
		json: true,
		resolveWithFullResponse: fullResponse
	};
	if (process.env.SHOW_URLS) {
		// eslint-disable-next-line
		console.log(url);
	}

	try {
		return await request(parameters);
	} catch (err) {
		return err;
	}
}

/**
 * Adds parameters to a given route
 * @param {string} url
 * @param {object} parameters
 * @return {string} - url with the added parameters
 */
function addParams(url, parameters) {
	let queryUrl = `${url}?`;
	for (let param in parameters) {
		// check object properties
		if (
			Object.prototype.hasOwnProperty.call(parameters, param) &&
			parameters[param]
		) {
			if (Array.isArray(parameters[param])) {
				queryUrl += `${param}=${parameters[param].join(`&${param}=`)}&`;
			} else {
				queryUrl += `${param}=${parameters[param]}&`;
			}
		}
	}
	return queryUrl;
}

/**
 * Generates a GET request with a list of query params
 * @param {string} url
 * @param {string} path
 * @param {object} parameters - key values to add to the url path
 * @return {Promise.<*>}
 */
function getRequest(url, path, parameters) {
	const queryUrl = addParams(`${url}/${path}`, parameters);
	return generalRequest(queryUrl, 'GET');
}

/**
 * Merge the schemas in order to avoid conflicts
 * @param {Array<string>} typeDefs
 * @param {Array<string>} queries
 * @param {Array<string>} mutations
 * @return {string}
 */
function mergeSchemas(typeDefs, queries, mutations) {
	return `${typeDefs.join('\n')}
    type Query { ${queries.join('\n')} }
    type Mutation { ${mutations.join('\n')} }`;
}

function formatErr(error) {
	const data = graphql.formatError(error);
	const { originalError } = error;
	if (originalError && originalError.error) {
		const { path } = data;
		const { error: { id: message, code, description } } = originalError;
		return { message, code, description, path };
	}
	return data;
}

const studentsTypeDef = `
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

const studentsQueries = `
    allStudents: [Student]!
    studentById(id: Int!): Student!
`;

const studentsMutations = `
    createStudent(student: StudentInput!): Student!
    deleteStudent(id: Int!): Student!
    updateStudent(id: Int!, student: StudentInput!): Student!
`;

const coursesTypeDef = `
type Course {
    id: Int!
    code: Int!
    name: String!
    credits: Int!
}

input CourseInput {
    code: Int!
    name: String!
    credits: Int!
}
`;

const coursesQueries = `
    allCourses: [Course]!
    courseById(id: Int!): Course!
`;

const coursesMutations = `
    createCourse(course: CourseInput!): Course!
    deleteCourse(id: Int!): Course!
    updateCourse(id: Int!, course: CourseInput!): Course!
`;

const gradesTypeDef = `
type Grade {
    id: Int!
    student_id: Int!
    course_code: Int!
    grade: Float!
}

input GradeInput {
    student_id: Int!
    course_code: Int!
    grade: Float!
}
`;

const gradesQueries = `
    allGrades: [Grade]!
    gradeById(id: Int!): Grade!
`;

const gradesMutations = `
    createGrade(grade: GradeInput!): Grade!
    deleteGrade(id: Int!): Grade!
    updateGrade(id: Int!, grade: GradeInput!): Grade!
`;

const url = process.env.STUDENTS_URL || '0.0.0.0';
const port = process.env.STUDENTS_PORT || '4000';
const entryPoint = process.env.STUDENTS_ENTRY || 'students';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
	Query: {
		allStudents: (_) =>
			getRequest(URL, ''),
		studentById: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'GET'),
	},
	Mutation: {
		createStudent: (_, { student }) =>
			generalRequest(`${URL}`, 'POST', student),
		updateStudent: (_, { id, student }) =>
			generalRequest(`${URL}/${id}`, 'PUT', student),
		deleteStudent: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'DELETE')
	}
};

const url$1 = process.env.COURSES_URL || '0.0.0.0';
const port$1 = process.env.COURSES_PORT || '4001';
const entryPoint$1 = process.env.COURSES_ENTRY || 'courses';

const URL$1 = `http://${url$1}:${port$1}/${entryPoint$1}`;

const resolvers$1 = {
	Query: {
		allCourses: (_) =>
			getRequest(URL$1, ''),
		courseById: (_, { id }) =>
			generalRequest(`${URL$1}/${id}`, 'GET'),
	},
	Mutation: {
		createCourse: (_, { course }) =>
			generalRequest(`${URL$1}`, 'POST', course),
		updateCourse: (_, { id, course }) =>
			generalRequest(`${URL$1}/${id}`, 'PUT', course),
		deleteCourse: (_, { id }) =>
			generalRequest(`${URL$1}/${id}`, 'DELETE')
	}
};

const url$2 = process.env.GRADES_URL || '0.0.0.0';
const port$2 = process.env.GRADES_PORT || '4002';
const entryPoint$2 = process.env.GRADES_ENTRY || 'grades';

const URL$2 = `http://${url$2}:${port$2}/${entryPoint$2}`;

const resolvers$2 = {
	Query: {
		allGrades: (_) =>
			getRequest(URL$2, ''),
		gradeById: (_, { id }) =>
			generalRequest(`${URL$2}/${id}`, 'GET'),
	},
	Mutation: {
		createGrade: (_, { grade }) =>
			generalRequest(`${URL$2}`, 'POST', grade),
		updateGrade: (_, { id, grade }) =>
			generalRequest(`${URL$2}/${id}`, 'PUT', grade),
		deleteGrade: (_, { id }) =>
			generalRequest(`${URL$2}/${id}`, 'DELETE')
	}
};

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		studentsTypeDef,
		coursesTypeDef,
		gradesTypeDef
	],
	[
		studentsQueries,
		coursesQueries,
		gradesQueries
	],
	[
		studentsMutations,
		coursesMutations,
		gradesMutations
	]
);

// Generate the schema object from your types definition.
var graphQLSchema = graphqlTools.makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		resolvers,
		resolvers$1,
		resolvers$2
	)
});

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;

app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	await next();
});

// GraphQL
const graphql$1 = apolloServerKoa.graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql$1);
router.get('/graphql', graphql$1);

// test route
router.get('/graphiql', apolloServerKoa.graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
