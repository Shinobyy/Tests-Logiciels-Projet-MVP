import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';
const USER_EMAIL = __ENV.USER_EMAIL || 'loadTest@example.com';
const USER_PASSWORD = __ENV.USER_PASSWORD || 'loadTestPassword';

export const options = {
	stages: [
		{ duration: '30s', target: 5 },
		{ duration: '1m', target: 10 },
		{ duration: '30s', target: 0 },
	],
	thresholds: {
		http_req_failed: ['rate<0.02'],
		http_req_duration: ['p(95)<800'],
	},
};

function login() {
	const payload = JSON.stringify({
		email: USER_EMAIL,
		password: USER_PASSWORD,
	});

	const res = http.post(`${BASE_URL}/auth/login`, payload, {
		headers: { 'Content-Type': 'application/json' },
	});

	check(res, {
		'login status 200': (r) => r.status === 200,
	});

	if (res.status !== 200) {
		return null;
	}

	const body = res.json();
	return body?.token || null;
}

function register() {
	const payload = JSON.stringify({
		email: USER_EMAIL,
		pseudonym: 'LoadTester',
		password: USER_PASSWORD,
	});

	const res = http.post(`${BASE_URL}/auth/register`, payload, {
		headers: { 'Content-Type': 'application/json' },
	});

	check(res, {
		'register status 200': (r) => r.status === 200,
	});

	if (res.status !== 200) {
		return null;
	}

	const body = res.json();
	return body?.token || null;
}

function authHeaders(token) {
	return {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
}

export default function () {
	let token = login();
	if (!token) {
		token = register();
		if (token) {
			token = login();
		}
	}
	if (!token) {
		sleep(1);
		return;
	}

	const headers = authHeaders(token);

	const categoriesRes = http.get(`${BASE_URL}/categories`, headers);
	check(categoriesRes, { 'categories 200': (r) => r.status === 200 });

	const articlesRes = http.get(`${BASE_URL}/articles`, headers);
	check(articlesRes, { 'articles 200': (r) => r.status === 200 });

	const myArticlesRes = http.get(`${BASE_URL}/users/me/articles`, headers);
	check(myArticlesRes, { 'my articles 200': (r) => r.status === 200 });

	const exchangesRes = http.get(`${BASE_URL}/exchanges`, headers);
	check(exchangesRes, { 'exchanges 200': (r) => r.status === 200 });

	const myArticles = myArticlesRes.json()?.articles || [];
	const allArticles = articlesRes.json()?.articles || [];
	const myArticle = myArticles[0];
	const otherArticle = allArticles.find((article) => article.user?.id !== myArticle?.user?.id);

	if (myArticle && otherArticle) {
		const createPayload = JSON.stringify({
			accepter_id: otherArticle.user.id,
			proposer_articles: [myArticle.id],
			accepter_articles: [otherArticle.id],
			message: 'Proposition d\'echange (k6)',
		});

		const createRes = http.post(`${BASE_URL}/exchanges`, createPayload, headers);
		check(createRes, { 'create exchange 200': (r) => r.status === 200 });

		const exchangeId = createRes.json()?.exchange_id;
		if (exchangeId) {
			const negotiationPayload = JSON.stringify({
				exchange_id: exchangeId,
				proposed_articles: [myArticle.id],
				requested_articles: [otherArticle.id],
				content: 'Contre-proposition (k6)',
			});

			const negotiationRes = http.post(`${BASE_URL}/negotiations`, negotiationPayload, headers);
			check(negotiationRes, { 'negotiation 200': (r) => r.status === 200 });
		}
	}

	sleep(1);
}
