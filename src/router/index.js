import { createWebHistory, createRouter } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/Home.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../pages/Login.vue'),
    },
    {
        path: '/mapa-teste',
        name: 'teste',
        component: () => import('../pages/MapaTeste.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;