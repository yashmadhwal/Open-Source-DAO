import { createWebHistory, createRouter } from "vue-router";
import Home from './components/Home.vue';

import PageNotFound from './pages/PageNotFound.vue';
import LaunchProject from './pages/LaunchProject.vue'
import GoFunding from './pages/GoFunding.vue';
import Voting from './pages/Voting.vue';

const routes = [
    {
        name: 'Home',
        path: '/',
        component: Home
    },
    {
        name: 'LaunchProject',
        path: '/LaunchProject',
        component: LaunchProject
    },
    {
        name: 'GoFunding',
        path: '/GoFunding',
        component: GoFunding
    },
    {
        name: 'Voting',
        path: '/Voting',
        component: Voting
    },
    {
        name: '404Error',
        path: '/:pathMatch(.*)*',
        component: PageNotFound
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;