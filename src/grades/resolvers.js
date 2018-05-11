import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
	Query: {
		allGrades: (_) =>
			getRequest(URL, ''),
		gradeById: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'GET'),
	},
	Mutation: {
		createGrade: (_, { grade }) =>
			generalRequest(`${URL}`, 'POST', grade),
		updateGrade: (_, { id, grade }) =>
			generalRequest(`${URL}/${id}`, 'PUT', grade),
		deleteGrade: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'DELETE')
	}
};

export default resolvers;
