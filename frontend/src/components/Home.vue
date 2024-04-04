<template>
    <NavHeader main-page="" />
    <!-- External Links -->
    <div class="flex-grow justify-center ">
        <router-link to='/LaunchProject'
            class="text-center text-[20px] w-[120px] tracking-[1px] grid place-content-center p-[3px] hover:cursor-pointer rounded-[15px] bg-[#ff0059]/[0.5] hover:bg-[#ff0059]">Lauch
            Project</router-link>
        <router-link to='/GoFunding'
            class="text-center text-[20px] w-[120px] tracking-[1px] grid place-content-center p-[3px] hover:cursor-pointer rounded-[15px] bg-[#ff0059]/[0.5] hover:bg-[#ff0059]">On Going Funds</router-link>
            <router-link to='/Voting'
            class="text-center text-[20px] w-[120px] tracking-[1px] grid place-content-center p-[3px] hover:cursor-pointer rounded-[15px] bg-[#ff0059]/[0.5] hover:bg-[#ff0059]">Go to Voting</router-link>
    </div>
    <div>
        <Footer></Footer>
    </div>
</template>

<script>

import NavHeader from './NavHeader.vue';
import Footer from './Footer.vue';

export default {
    name: 'Home',
    components: {
        NavHeader,
        Footer
    }
}
</script>

<style>
* {
    /* border: 1px solid; */
    font-family: 'Amatic SC', sans-serif;
    font-family: 'Fira Mono', monospace;
}
</style>