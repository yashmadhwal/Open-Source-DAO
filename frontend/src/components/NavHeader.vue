<template>
    <!-- Title Heading -->
    <div class="relative">
        <div>
            <h1
                class="headFont text-5xl text-center tracking-wide p-[20px] pb-[10px] border-b-[3px] border-[#675F3E] w-max mx-auto">
                Open Source DAO</h1>
        </div>

        <!-- Connect Wallet -->
        <div class="border-b-[2px] border-[#675F3E] mx-auto p-[10px] w-full">
            <ConnectWallet />
        </div>
        <div v-if="!mainPage" class="mx-auto w-[150px] sm:absolute right-[25px] m-[10px]">
            <router-link to="/">
                <Button buttonText="To Main" class="w-full"></Button>
            </router-link>
        </div>
    </div>
</template>

<script>
import ConnectWallet from './ConnectWallet.vue';
import Button from './Button.vue'

export default {
    name: 'navheader',
    components: {
        ConnectWallet,
        Button
    },
    props: {
        mainPage: Boolean
    }
}
</script>

<style>
* {
    /* border: 1px solid; */
}

.headFont {
    font-family: 'Amatic SC', sans-serif;
    font-family: 'Fira Mono', monospace;
}
</style>