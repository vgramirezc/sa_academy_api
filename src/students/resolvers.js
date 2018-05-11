import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

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

export default resolvers;